"use client";

import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { MessageComp as PreviewMessage } from "./ui/message";

export default function ChatInterface({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Message[];
}) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
    initialMessages,
    id,
    onFinish: () => {
      window.history.replaceState({}, "", `/chat/${id}`);
    },
    experimental_throttle: 50,
  });

  return (
    <div className="flex flex-col w-full max-w-2xl pt-4 py-32">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id ?? `msg-${index}`}
            chatId={id}
            role={message.role}
            content={message.content}
            message={message}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 w-full max-w-2xl mx-auto px-4"
      >
        <input
          className="w-full p-3 mb-8 border border-zinc-600 rounded-lg shadow-xl bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
