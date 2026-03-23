import { parseFields } from "./parser";
import { redis } from "./redis";
import { updatePrice, getPrice, getBalance, updateBalance, updatePosition } from "./state";
import type { CreateOrderEvent, PriceEvent } from "@option_trading/shared";

export async function startConsumer() {
  console.log("Engine listening to the stream sir..");
  let lastId = "0-0";

  while (true) {
    try {
      const response = await redis.xread(
        "BLOCK",
        0,
        "STREAMS",
        "trade",
        lastId
      );

      if (!response) continue;

      const [, messages] = response[0];

      for (const message of messages) {
        const [id, fields] = message;
        lastId = id;
        const parsed = parseFields(fields);

        if (parsed.type === "PRICE_UPDATE") {
          const event: PriceEvent = {
            type: "PRICE_UPDATE",
            symbol: parsed.symbol,
            price: Number.parseFloat(parsed.price),
            timestamp: Number.parseInt(parsed.timestamp)
          };
          updatePrice(event.symbol, event.price);
          console.log(`Stored ${event.symbol}->${event.price}`);
        }

        if (parsed.type === "CREATE_ORDER") {
          console.log(`Processing CREATE_ORDER: ${parsed.userId} ${parsed.side} ${parsed.quantity} ${parsed.symbol}`);
          
          try {
            const quantity = parseFloat(parsed.quantity);
            const event: CreateOrderEvent = {
              type: "CREATE_ORDER",
              userId: parsed.userId,
              symbol: parsed.symbol,
              side: parsed.side as "BUY" | "SELL",
              quantity: quantity,
            };

            const currentPrice = getPrice(event.symbol);

            if (!currentPrice) {
              console.log(`No price for ${event.symbol}`);
              await redis.xadd(
                "engine-response",
                "*",
                "type",
                "ORDER_REJECTED",
                "userId",
                event.userId,
                "reason",
                "NO_PRICE"
              );
              continue;
            }

            const balance = getBalance(event.userId);
            const cost = currentPrice * event.quantity;

            if (event.side === "BUY") {
              if (balance < cost) {
                console.log(`Insufficient balance for ${event.userId}`);
                await redis.xadd(
                  "engine-response",
                  "*",
                  "type",
                  "ORDER_REJECTED",
                  "userId",
                  event.userId,
                  "reason",
                  "INSUFFICIENT_BALANCE"
                );
                continue;
              }
              updateBalance(event.userId, balance - cost);
              updatePosition(event.userId, event.symbol, event.quantity);
              
              await redis.xadd(
                "engine-response",
                "*",
                "type",
                "ORDER_FILLED",
                "userId",
                event.userId,
                "symbol",
                event.symbol,
                "side",
                event.side,
                "price",
                currentPrice.toString(),
                "quantity",
                event.quantity.toString()
              );
              console.log(`Order filled: ${event.userId} BUY ${event.quantity} ${event.symbol} @ ${currentPrice}`);
            } else if (event.side === "SELL") {
              updateBalance(event.userId, balance + cost);
              updatePosition(event.userId, event.symbol, -event.quantity); 

              await redis.xadd(
                "engine-response",
                "*",
                "type",
                "ORDER_FILLED",
                "userId",
                event.userId,
                "symbol",
                event.symbol,
                "side",
                event.side,
                "price",
                currentPrice.toString(),
                "quantity",
                event.quantity.toString()
              );
              console.log(`Order filled: ${event.userId} SELL ${event.quantity} ${event.symbol} @ ${currentPrice}`);
            }
          } catch (e) {
            console.error("Error processing CREATE_ORDER:", e);
          }
        }
      }
    } catch (err) {
      console.error("Error in consumer:", err);
    }
  }
}