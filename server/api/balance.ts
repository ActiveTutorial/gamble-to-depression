import { H3Event, getCookie, readBody } from "h3";
import redis from "../redis";

interface SetBalanceRequestBody {
  balance: number;
}

export default defineEventHandler(async (event: H3Event) => {
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

  if (event.node.req.method === "GET") {
    // Return the current balance
    return { balance: session.balance };
  } else if (event.node.req.method === "PUT") {
    const body = await readBody<SetBalanceRequestBody>(event);

    // Update session balance
    session.balance = body.balance;

    // Save updated session data to Redis
    await redis.set(sessionId, JSON.stringify(session), "EX", 3600);

    // Return success response
    return { success: true };
  } else {
    throw new Error("Unsupported HTTP method");
  }
});
