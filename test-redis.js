const { Redis } = require("@upstash/redis");
require("dotenv").config();

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function testRedis() {
  try {
    console.log("Testing Redis connection...");

    // Get all keys
    const keys = await redis.keys("*");
    console.log("All keys in Redis:", keys);

    // If there are keys, let's see their values
    if (keys.length > 0) {
      for (const key of keys) {
        const value = await redis.hgetall(key);
        console.log(`Key: ${key}, Value:`, value);
      }
    } else {
      console.log("No keys found in Redis");

      // Let's create a test chat
      const testChatId = "test-chat-123";
      const testUserId = "user_test123"; // Replace with your actual Clerk user ID

      await redis.hset(testChatId, {
        messages: JSON.stringify([
          { id: "1", role: "user", content: "Hello" },
          { id: "2", role: "assistant", content: "Hi there!" },
        ]),
        userId: testUserId,
        createdAt: new Date().toISOString(),
      });

      console.log("Created test chat with ID:", testChatId);

      // Verify it was created
      const testChat = await redis.hgetall(testChatId);
      console.log("Test chat:", testChat);
    }
  } catch (error) {
    console.error("Redis test failed:", error);
  }
}

testRedis();
