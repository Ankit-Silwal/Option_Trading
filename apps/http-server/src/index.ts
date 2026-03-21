import dotenv from "dotenv"
dotenv.config()

import express from "express";
import router from "./routes";
import "./redis"
const PORT=process.env.PORT ||8000;
const app=express();

app.use(express.json());
app.use("/api",router);

app.listen(PORT,()=>{
  console.log(`HTTP server has started at port no ${PORT}`)
})