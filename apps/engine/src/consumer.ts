import { parseFields } from "./parser";
import { redis } from "./redis";
import type { PriceEvent } from "@option_trading/shared";
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
        console.log("Parsed Event",event);
      }
    }

  }

}