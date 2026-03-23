import "./redis"

import { startConsumer } from "./consumer"
import { setBalance } from "./state";
async function main(){
  console.log("Engine started");
  setBalance("1",10000);
  await startConsumer();
}

main();

