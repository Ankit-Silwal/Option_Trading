import WebSocket from "ws";
import { redis } from "./redis";
import { BinanceTradingMessage,PriceEvent } from "../types";

export function startBinance():void{
  const ws=new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

  ws.on("open",()=>{
    console.log("The websocket is connected");
  })

  ws.on("message",async (data:WebSocket.RawData)=>{
    try{
      const msg:BinanceTradingMessage=JSON.parse(data.toString());
      
      const price=parseFloat(msg.price);

      if(isNaN(price)) return;

      const event:PriceEvent={
        type:"PRICE_UPDATE",
        symbol:msg.symbol,
        price,
        timestamp:Date.now()
      }
      await redis.xadd(
        "trade",
        "*",
        "type",
        event.type,
        "symbol",
        event.symbol,
        "price",
        event.price.toString(),
        "timestamp",
        event.timestamp.toString()
      );

      console.log(`${event.symbol}:${event.price}`)
    }catch(err){
      console.log(`An error occured as `,err);
    }
  })

  ws.on("close",()=>{
    console.log("Binance disconnected..Reconnecting");
    setTimeout(startBinance,10000);
  })

  ws.on("error",(err)=>{
    console.log(`An error occured as ${err}`)
  })

}