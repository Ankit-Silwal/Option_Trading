import { WebSocketServer, WebSocket } from "ws";
import Redis from "ioredis";

const wss = new WebSocketServer({ port: 8080 });
const redis = new Redis();

console.log("Websocket running on the port no 8080");

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  console.log("Client is connected to the websocket server");

  ws.send(JSON.stringify({ message: "Connected to Option Trading WS" }));
});

async function start() {
  let lastId = "$";
  while (true) {
    try {
      const response = await redis.xread(
        "BLOCK",
        0,
        "STREAMS",
        "engine-response",
        lastId
      );

      if (!response) continue;

      const [stream] = response;
      const messages = stream[1]; 

      for (const message of messages) {
        const [id, fields] = message;
        lastId = id;

        const data: Record<string, string> = {};
        for (let i = 0; i < fields.length; i += 2) {
          data[fields[i]] = fields[i + 1];
        }
        
        console.log("Broadcasting ", data);
        
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (error) {
      console.error("Error reading from Redis:", error);
    }
  }
}

start();