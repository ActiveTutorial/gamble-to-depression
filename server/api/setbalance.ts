import { H3Event, getCookie } from "h3";
import Redis from "ioredis";
import { redisConfig } from "../config";

const redis = new Redis({
  username: redisConfig.username,
  password: redisConfig.password,
  host: redisConfig.host,
  port: redisConfig.port,
});

interface SetBalanceRequestBody {
  balance: number;
}

export default defineEventHandler(async (event: H3Event): Promise<{ success: boolean }> => {
  // Get session ID
  const sessionId = getCookie(event, "session_id");
  if (!sessionId) {
    throw new Error("Session ID not found");
  }

  // Retrieve session data from Redis
  const sessionData = await redis.get(sessionId);
  if (!sessionData) {
    throw new Error("Session not found");
  }

  const session = JSON.parse(sessionData);
  const body = await readBody<SetBalanceRequestBody>(event);

  // Update session balance
  session.balance = body.balance;

  // Save updated session data to Redis
  await redis.set(sessionId, JSON.stringify(session), "EX", 3600);

  // Return success response
  return { success: true };
});
