const prices=new Map<string,number>();
const balances=new Map<string,number>();
const positions=new Map<string,Map<string,number>>();
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

export function getPosition(userId:string,symbol:string):number{
  const userPositions=positions.get(userId);
  if(!userPositions) return 0;
  return userPositions.get(symbol) || 0;
}

export function updatePosition(
  userId:string,
  symbol:string,
  amount:number
){
  let userPositions=positions.get(userId);

  if(!userPositions){
    userPositions=new Map();
    positions.set(userId,userPositions);
  }

  const current=userPositions.get(symbol)||0;
  userPositions.set(symbol,current+amount); 

}