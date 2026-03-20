export interface BinanceTradingMessage{
  event:string;
  event_time:number;
  symbol:string;
  price:string;
}

export interface PriceEvent{
  type:"PRICE_UPDATE";
  symbol:string;
  price:number;
  timestamp:number;
}