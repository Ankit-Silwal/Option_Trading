const prices=new Map<string,number>();
const balances=new Map<string,number>();

export function updatePrice(symbol:string,price:number){
  prices.set(symbol,price);
}

export function getPrice(symbol:string):number| undefined{
  return prices.get(symbol)
}

export function setBalance(userId:string,amount:number){
  balances.set(userId,amount);
}

export function getBalance(userId:string):number{
  return balances.get(userId) || 0;
}

export function updateBalance(userId:string,amount:number){
  balances.set(userId,amount);
}