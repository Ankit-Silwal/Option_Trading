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
  while (true)
  {
    try
    {
      const response = await redis.xread(
        "BLOCK",
        0,
        "STREAMS",
        "engine-response",
        "$"
      );

      if (!response) continue;
      const [, messages] = response[0];
      for (const [, fields] of messages)
      {
        const data: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2)
        {
          data[fields[i]] = fields[i + 1];
        }
        console.log("📥 Event received:", data);
        if (data.type === "ORDER_FILLED")
        {
          await prisma.trade.create({
            data: {
              userId: Number(data.userId),
              symbol: data.symbol,
              side: data.side,
              price: Number(data.price),
              quantity: Number(data.quantity),
            }
          });

          console.log("Trade saved to DB");
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