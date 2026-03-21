import Redis from "ioredis"

export const redis=new Redis("redis://localhost:6379");

redis.on("connection",()=>{
  console.log("Engine connected to the redis");
})