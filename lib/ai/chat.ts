import { Message } from "ai";

export type ChatThread = {
  id: string;
  messages: Message[];
  userId: string;
  createdAt: string;
};
