"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { type Message } from "ai";
import { MemoizedMarkdown } from "./memoized-markdown";

import { Bot, User } from "lucide-react";

export const MessageComp = ({
  chatId,
  role,
  content,
  message,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  message: Message;
}) => {
  return (
    <motion.div
      className="flex w-full flex-row justify-center gap-4 px-4 first-of-type:pt-4 md:px-0 md:first-of-type:pt-6" // add justify-center, remove md:w-[500px]
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="flex size-6 shrink-0 flex-col items-center justify-center rounded-sm border border-zinc-500 p-1 text-zinc-500">
        {role === "assistant" ? <Bot /> : <User />}
      </div>

      <div className="flex w-full flex-col gap-2 text-wrap break-words whitespace-pre-wrap">
        {Array.isArray(message.parts) &&
          message.parts.map((part, i) =>
            part.type === "tool-invocation" ? (
              <span
                key={`tool-${message.id}-${i}`}
                className="italic font-light"
              >
                {"calling tool: " + part.toolInvocation.toolName}
              </span>
            ) : null,
          )}
        {content && typeof content === "string" && (
          <div className="flex flex-col gap-4 text-zinc-300">
            <MemoizedMarkdown
              key={message.id}
              id={message.id}
              content={message.content}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
