import { parseFields } from "./parser";
import { redis } from "./redis";
import { updatePrice,getPrice, getBalance, updateBalance } from "./state";
import type { CreateOrderEvent, PriceEvent } from "@option_trading/shared";
export async function startConsumer(){
  console.log("Engine listening to the stream sir..")

  while(true){
    const response=await redis.xread(
      "BLOCK",
      0,
      "STREAMS",
      "trade",
      "$"
    );

    if(!response) continue;

    const [,messages]=response[0];

    for(const message of messages){
      const [,fields]=message;
      const parsed=parseFields(fields);
      if(parsed.type==="PRICE_UPDATE"){
        const event:PriceEvent={
          type:"PRICE_UPDATE",
          symbol:parsed.symbol,
          price:Number.parseFloat(parsed.price),
          timestamp:Number.parseInt(parsed.timestamp)
        };
        updatePrice(event.symbol,event.price);

        console.log(`Stored ${event.symbol}->${event.price}`)
      }
      if(parsed.type==="CREATE_ORDER"){
        const event:CreateOrderEvent={
          type:"CREATE_ORDER",
          userId:parsed.userId,
          symbol:parsed.symbol,
          side:parsed.side as "BUY" | "SELL",
          amount:parseFloat(parsed.amount),
        };

        const currentPrice=getPrice(event.symbol);

        if(!currentPrice){
          await redis.xadd(
            "engine-response",
            "*",
            "type",
            "ORDER_REJECTED",
            "userId",
            event.userId,
            "reason",
            "NO_PRICE"
          )
          continue;
        }

        const balance=getBalance(event.userId);
        const cost=currentPrice*event.amount

        console.log(`Order received:${event.side} ${event.amount} ${event.symbol}`);        
        if(event.side==="BUY"){
          if(balance<cost){
            await redis.xadd(
              "engine-response",
              "*",
              "type",
              "ORDER_REJECTED",
              "userId",
              event.userId,
              "reason",
              "INSUFFICIENT_BALANCE"
            )
            continue;
          }
          updateBalance(event.userId,balance-cost);
          await redis.xadd(
            "engine-response",
            "*",
            "type",
            "ORDER_FILLED",
            "userId",
            event.userId,
            "symbol",
            event.symbol,
            "price",
            currentPrice.toString(),
            "amount",
            event.amount.toString()
          )
        }
        if(event.side==="SELL"){
          updateBalance(event.userId,balance+cost);
          console.log(`Sell executed.New balance:${balance+cost}`)
        }
      }
    }
  }
}