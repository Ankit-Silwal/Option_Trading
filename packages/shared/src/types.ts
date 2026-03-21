export type EventType="PRICE_UPDATE" |"CREATE_ORDER" |"ORDER_FILLED"

export interface PriceEvent{
  type:"PRICE_UPDATE",
  symbol:string,
  price:number,
  timestamp:number
}

export interface CreateOrderEvent{
  type:"CREATE_ORDER",
  userId:string,
  symbol:string,
  side:"BUY"|"SELL",
  amount:number
}

export interface EngineResponseEvent{
  type:"ORDER_FILLED",
  orderId:string,
  userId:string,
  price:number
}

export type TradeEvent=PriceEvent|CreateOrderEvent;