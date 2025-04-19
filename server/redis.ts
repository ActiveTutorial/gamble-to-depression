import Redis from "ioredis";
import { redisConfig } from "./config";

const redis = new Redis({
  username: redisConfig.username,
  password: redisConfig.password,
  host: redisConfig.host,
  port: redisConfig.port,
});

export default redis;
