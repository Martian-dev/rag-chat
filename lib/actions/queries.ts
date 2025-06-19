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
