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
    <div className="flex flex-col w-full max-w-2xl pt-4 py-32 mx-auto stretch">
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
        className="sticky bottom-0 bg-gray-600 text-white"
      >
        <input
          className="fixed bottom-0 w-full max-w-2xl p-2 mb-8 border-none active:border-none rounded shadow-xl bg-gray-600 text-white"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
