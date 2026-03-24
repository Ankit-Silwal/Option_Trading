import dotenv from "dotenv"
dotenv.config()
import Redis from "ioredis";
import { PrismaPg } from "@prisma/adapter-pg";
import {PrismaClient} from "./generated/prisma/client"

const redis=new Redis("redis://localhost:6379");
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma=new PrismaClient({ adapter });


async function start()
{
  console.log("DB started")
  let lastId = "0-0";
  while (true)
  {
    try
    {
      const response = await redis.xread(
        "BLOCK",
        0,
        "STREAMS",
        "engine-response",
        lastId
      );

      if (!response) continue;
      const [, messages] = response[0];
      for (const message of messages)
      {
        const [id, fields] = message;
        lastId = id;
        const data: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2)
        {
          data[fields[i]] = fields[i + 1];
        }
        console.log("Event received:", data);
        if(!data.type){
          console.log("Missing type skipping");
          continue;
        }
        if(data.type==="ORDER_PENDING"){
          await prisma.trade.upsert({
            where: {
              orderId: data.orderId
            },
            update: {},
            create: {
              orderId: data.orderId,
              userId: Number(data.userId),
              symbol: "",
              side: "",
              price: 0,
              quantity: 0,
              status: "PENDING"
            }
          });
        }
        if (data.type === "ORDER_FILLED") {
          console.log(`Processing ORDER_FILLED: ${data.userId} ${data.symbol}`);
          
          if(!data.userId || !data.symbol || !data.price || !data.quantity || !data.side){
            console.log("Continue due to missing fields");
            continue;
          }

          await prisma.trade.update({
            where: {
              orderId: data.orderId
            },
            data: {
              userId: Number(data.userId),
              symbol: data.symbol,
              side: data.side,
              price: Number(data.price),
              quantity: Number(data.quantity),
              status: "FILLED"
            }
          });

          console.log("Trade saved to DB");
        }

        if(data.type==="ORDER_REJECTED"){
          await prisma.trade.update({
            where:{orderId:data.orderId},
            data:{
              status:"REJECTED"
            }
          })
          console.log("UPdate order to rejected",data.orderId)
        }
      }
    }
    catch (err)
    {
      console.error("Error in DB Worker:", err);
    }
  }
}

start();