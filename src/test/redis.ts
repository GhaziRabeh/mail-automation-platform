import { redis } from "../config/redis";

redis.ping()
  .then((result)=>{
    console.log(result);
    process.exit();
  });