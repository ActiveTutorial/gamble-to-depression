import { H3Event, setCookie, getCookie } from "h3";
import { v4 as uuidv4 } from "uuid";
import redis from "../redis";

export default defineEventHandler(async (event: H3Event) => {
  // Check if session ID already exists
  let sessionId = getCookie(event, "session_id");
  if (!sessionId) {
    // Create a new session ID
    sessionId = uuidv4();
    setCookie(event, "session_id", sessionId, { httpOnly: true, maxAge: 3600 });
  }

  // Check if session exists in Redis
  const sessionData = await redis.get(sessionId);
  if (!sessionData) {
    // Initialize session with default balance
    const initialBalance = 0;
    await redis.set(sessionId, JSON.stringify({ balance: initialBalance }), "EX", 3600);
  }

  return { success: true };
});
