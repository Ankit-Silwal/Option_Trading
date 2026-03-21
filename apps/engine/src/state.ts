const prices=new Map<string,number>();


export function updatePrice(symbol:string,price:number){
  prices.set(symbol,price);
}

export function getPrice(symbol:string):number| undefined{
  return prices.get(symbol)
}