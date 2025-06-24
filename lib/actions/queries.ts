import "server-only";
import { Redis } from "@upstash/redis";
import { Message } from "ai";
import { ChatThread } from "../ai/chat";

const chatThreads = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function getChatByID({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  const rawChatThread = await chatThreads.hgetall(id);

  if (!rawChatThread || !rawChatThread.userId) {
    return null;
  }

  if (rawChatThread.userId != userId) return null;

  const chatThread: ChatThread = {
    id,
    messages: rawChatThread.messages as Message[],
    userId,
    createdAt: rawChatThread.createdAt as string,
  };

  return chatThread;
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: Message[];
  userId: string;
}) {
  const chatThread = await chatThreads.hgetall(id);

  if (!chatThread) {
    return await chatThreads.hset(id, {
      messages,
      userId,
      createdAt: new Date().toISOString(),
    });
  }

  const currentUserId = chatThread.userId as string;
  const createdAt = chatThread.createdAt as string;

  if (currentUserId != userId) {
    return null;
  }

  return await chatThreads.hset(id, {
    messages,
    userId,
    createdAt,
  });
}

async function getAllKeyValuePairs() {
  try {
    let cursor = "0";
    const allPairs: any = {};

    do {
      const [newCursor, keys] = await chatThreads.scan(cursor, { match: "*" });

      if (keys.length > 0) {
        // Use Promise.all to fetch all hash objects in parallel
        const hashPromises = keys.map(async (key) => {
          try {
            const hashData = await chatThreads.hgetall(key);
            return { key, data: hashData };
          } catch (error) {
            console.error(`Error fetching hash for key ${key}:`, error);
            return { key, data: null };
          }
        });

        const results = await Promise.all(hashPromises);

        results.forEach(({ key, data }) => {
          if (data && Object.keys(data).length > 0) {
            allPairs[key] = data;
          }
        });
      }

      cursor = newCursor;
    } while (cursor !== "0");

    return allPairs;
  } catch (error) {
    console.error("Error fetching key-value pairs:", error);
    throw error;
  }
}

export async function getAllChatForUser({ userId }: { userId: string }) {
  try {
    const allKeyValuePairs = await getAllKeyValuePairs();
    const userChats: ChatThread[] = [];

    // Iterate through all key-value pairs and filter by userId
    for (const [chatId, chatData] of Object.entries(allKeyValuePairs)) {
      // Check if the chat belongs to the user
      if (chatData && typeof chatData === "object" && "userId" in chatData) {
        const rawChatThread = chatData as any;

        if (rawChatThread.userId === userId) {
          const chatThread: ChatThread = {
            id: chatId,
            messages: rawChatThread.messages as Message[],
            userId: rawChatThread.userId,
            createdAt: rawChatThread.createdAt as string,
          };

          userChats.push(chatThread);
        }
      }
    }

    // Sort by createdAt in descending order (newest first)
    return userChats.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error fetching chats for user:", error);
    throw error;
  }
}
