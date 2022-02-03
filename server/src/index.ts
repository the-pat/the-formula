import * as dotenv from "dotenv";
import start from "./app";
import { Config } from "./config";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const config = new Config();
start(config)
  .then(() => console.log("started"))
  .catch(console.error);
