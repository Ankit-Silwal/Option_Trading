import { redis } from "./redis";

export async function startConsumer(){
  console.log("Engine listening to the stream sir..")

  while(true){
    const response=await redis.xread(
      "BLOCK",
      0,
      "STREAMS",
      "trade",
      "$"
    );

    if(!response) continue;

    const [stream,messages]=response[0];

    for(const message of messages){
      const [id,fields]=message;
      console.log("Event received",fields)
    }

  }

}