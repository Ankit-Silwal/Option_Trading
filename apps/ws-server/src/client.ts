import { WebSocket } from "ws";

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", () => {
    console.log("Connected to WS server");
});

ws.on("message", (msg) => {
  console.log("📡 Received:", JSON.parse(msg.toString()));
});

ws.on("error", console.error);