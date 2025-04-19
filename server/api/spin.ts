import { H3Event, setCookie, getCookie } from "h3";
import { v4 as uuidv4 } from "uuid";
import Redis from "ioredis";
import { redisConfig } from "../config";

const redis = new Redis({
  username: redisConfig.username,
  password: redisConfig.password,
  host: redisConfig.host,
  port: redisConfig.port,
});

interface SpinRequestBody {
  balance: number;
  risk: number;
}

interface SpinResponse {
  newBalance: number;
  netChange: number;
}

export default defineEventHandler(async (event: H3Event): Promise<SpinResponse> => {
  // Get session ID
  let sessionId = getCookie(event, "session_id");
  if (!sessionId) {
    throw new Error("Session ID not found");
  }

  // Retrieve session data from Redis
  const sessionData = await redis.get(sessionId);
  if (!sessionData) {
    throw new Error("Session not found");
  }

  const session = JSON.parse(sessionData);
  const body = await readBody<SpinRequestBody>(event);
  let { balance, risk } = body;

  // Check if the balance in the request matches the stored balance
  if (balance !== session.balance) {
    //throw new Error("Balance mismatch between client and server");
    balance = session.balance; // Use the stored balance
  }

  // Prevent negative balance
  const maxChange = Math.min(balance, risk);
  const randomNumber = Math.random();
  const expectedLoss = -2;
  const adjustedRandomNumber = (randomNumber - 0.5) * 2;
  const netChange = Math.round(adjustedRandomNumber * maxChange + expectedLoss);

  // Update session balance
  session.balance = Math.max(0, session.balance + netChange);

  // Save updated session data to Redis
  await redis.set(sessionId, JSON.stringify({ balance: session.balance }), "EX", 3600);

  return { newBalance: session.balance, netChange };
});
