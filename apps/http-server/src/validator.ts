import {z} from "zod";

export const tradeSchema=z.object({
  userId:z.string(),
  symbol:z.string(),
  side:z.enum(["BUY","SELL"]),
  amount:z.number().positive()
})