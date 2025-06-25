"use client";

import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { MessageComp as PreviewMessage } from "./ui/message";

export default function ChatInterface({
  id,
  initialMessages,
  isNewChat = false,
}: {
  id: string;
  initialMessages: Message[];
  isNewChat?: boolean;
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

  // Determine if we should show as new chat (no messages yet)
  const showAsNewChat = isNewChat && messages.length === 0;

  return (
    <div
      className={`flex flex-col w-full max-w-2xl mx-auto ${
        showAsNewChat ? "h-screen justify-center items-center" : "min-h-full"
      }`}
    >
      {!showAsNewChat && messages.length > 0 && (
        <div className="space-y-4 pt-4 pb-4 text-left px-4">
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
      )}

      <form
        onSubmit={handleSubmit}
        className={`w-full px-4 ${
          showAsNewChat ? "flex justify-center" : "sticky bottom-0 bg-zinc-800 pb-4"
        }`}
      >
        <input
          className={`p-3 mb-8 border border-zinc-600 rounded-lg shadow-xl bg-zinc-700 text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 text-center ${
            showAsNewChat ? "w-full max-w-md" : "w-full"
          }`}
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
