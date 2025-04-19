export default defineEventHandler(async (event) => {
  const body = await readBody(event); // Read the request body
  const { balance, risk } = body;

  // Prevent negative balance
  const maxChange = Math.min(balance, risk);
  const randomNumber = Math.random();
  const expectedLoss = -2; // Just enough to not be noticeable
  // Adjust the random number to be between -1 and 1
  const adjustedRandomNumber = (randomNumber - 0.5) * 2;
  // Calculate the net change
  const netChange = Math.round(adjustedRandomNumber * maxChange + expectedLoss);

  // Calculate the new balance
  const newBalance = Math.max(0, balance + netChange);

  return { newBalance, netChange };
});
