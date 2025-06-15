"use client";

import { useChat } from "@ai-sdk/react";
import { User, Bot } from "lucide-react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
  });

  return (
    <div className="flex flex-col w-full max-w-md py-32 mx-auto stretch">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div className="flex gap-3">
              <div className="font-bold">
                {m.role == "user" ? <User /> : <Bot />}
              </div>
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {"calling tool: " + m?.toolInvocations?.[0].toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-gray-600 text-white"
      >
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border-none active:border-none rounded shadow-xl bg-gray-600 text-white"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
