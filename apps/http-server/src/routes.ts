import { Router } from "express";
import {redis} from "./redis"
import { tradeSchema } from "./validator";

const router=Router();

router.post("/trade",async (req,res)=>{
  try{
    const data=tradeSchema.parse(req.body);

    await redis.xadd( 
      "trade",
      "*",
      "type",
      "CREATE_ORDER",
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
      status:"Order received"
    })
  }catch(err){
    res.status(400).json({
      error:`Invalid request ${err}`
    })
  }
})

export default router;