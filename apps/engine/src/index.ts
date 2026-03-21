import "./redis"

import { startConsumer } from "./consumer"

async function main(){
  console.log("Engine started");
  await startConsumer();
}

main();