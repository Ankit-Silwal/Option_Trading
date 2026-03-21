import "./redis"

import { startConsumer } from "./consumer"
import { setBalance } from "./state";
async function main(){
  console.log("Engine started");
  await startConsumer();
  setBalance("ankit",10000);
}

main();

