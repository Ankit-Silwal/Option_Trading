import { Router } from "express";
import {redis} from "./redis"
import { tradeSchema } from "./validator";
import { randomUUID } from "crypto";
const router=Router();

router.post("/trade",async (req,res)=>{
  try{
    const data=tradeSchema.parse(req.body);
    const orderId=randomUUID()
    await redis.xadd(
      "engine-response",
      "*",
      "type","ORDER_PENDING",
      "orderId",orderId,
      "userId",data.userId
    )
    await redis.xadd( 
      "trade",
      "*",
      "type",
      "CREATE_ORDER",
      "orderId",
      orderId,
      "userId",
      data.userId,
      "symbol",
      data.symbol,
      "side",
      data.side,
      "price",
      data.price.toString(),
      "quantity",
      data.quantity.toString()
    );
    console.log(`Order received: ${data.side} ${data.quantity} ${data.symbol} @ ${data.price}`);
    res.json({
      status:"Order received",
      orderId:orderId
    })
  }catch(err){
    res.status(400).json({
      error:`Invalid request ${err}`
    })
  }
})

export default router;