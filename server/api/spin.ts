import { H3Event, getCookie } from "h3";
import redis from "../redis";

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
  const { risk } = body;
  const balance = session.balance;

  // Prevent negative balance
  const maxChange = Math.min(balance, risk);
  // Get a random number between -1 and 1
  const randomNumber = Math.random();
  const expectedLoss = -2;
  const adjustedRandomNumber = (randomNumber - 0.5) * 2;
  // Calculate net change based on risk
  const netChange = Math.round(adjustedRandomNumber * maxChange + expectedLoss);

  // Update session balance
  session.balance = Math.max(0, session.balance + netChange);

  // Save updated session data to Redis
  await redis.set(sessionId, JSON.stringify({ balance: session.balance }), "EX", 3600);

  return { newBalance: session.balance, netChange };
});
