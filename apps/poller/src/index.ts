import "dotenv/config";
import "./redis";
import { startBinance } from "./binance";
async function main(){
  console.log("Poller started")
  startBinance();
}

main();