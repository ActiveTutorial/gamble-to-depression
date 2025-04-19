import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const redisConfig = {
  username: process.env.REDIS_USERNAME as string,
  password: process.env.REDIS_PASSWORD as string,
  host: process.env.REDIS_HOST as string,
  port: parseInt(process.env.REDIS_PORT || "6379"),
};
