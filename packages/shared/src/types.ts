export type EventType="PRICE_UPDATE" |"CREATE_ORDER" |"ORDER_FILLED"

export interface PriceEvent{
  type:"PRICE_UPDATE",
  symbol:string,
  price:number,
  timestamp:number
}

export interface CreateOrderEvent{
  type:"CREATE_ORDER",
  orderId:string,
  userId:string,
  symbol:string,
  side:"BUY"|"SELL",
  quantity:number
}

export interface EngineResponseEvent{
  type:"ORDER_FILLED",
  orderId:string,
  userId:string,
  price:number
}

export interface OrderFilledEvent{
  type:"ORDER_FILLED",
  orderId:string,
  userId:string,
  symbol:string,
  side: "BUY" | "SELL",
  price:number,
  quantity:number,
}

export interface OrderRejectEvent{
  type:"ORDER_REJECTED",
  orderId:string,
  userId:string,
  reason:string
}

export type EngineResponse=OrderFilledEvent|OrderRejectEvent


export type TradeEvent=PriceEvent|CreateOrderEvent;