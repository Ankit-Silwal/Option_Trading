export interface BinanceTradingMessage{
  e:string; //event
  E:number; //event_time
  s:string; //symbol
  p:string; //price
}

export interface PriceEvent{
  type:"PRICE_UPDATE";
  symbol:string;
  price:number;
  timestamp:number;
}