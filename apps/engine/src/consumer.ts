import { parseFields } from "./parser";
import { redis } from "./redis";
import { updatePrice,getPrice } from "./state";
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
          console.log("No prices available yet");
          continue;
        }

        console.log(`Order received:${event.side} ${event.amount} ${event.symbol}`);        
        console.log(`Execute at price ${currentPrice} for user ${event.userId}`)
      }
    }
  }
}