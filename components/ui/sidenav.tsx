import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getAllChatForUser } from "@/lib/actions/queries";
import { redirect } from "next/navigation";
import { ChatThread } from "@/lib/ai/chat";

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }
}

export default async function SideNav() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="w-64 h-full bg-zinc-800 border-r border-zinc-700/50 p-4">
        <p className="text-zinc-400 text-sm">Please sign in to view chats</p>
      </div>
    );
  }

  let chats: ChatThread[] = [];
  try {
    chats = await getAllChatForUser({ userId });
  } catch (error) {
    console.error("SideNav: Error fetching chats:", error);
  }

  return (
    <div className="w-64 h-full bg-zinc-800 border-r border-zinc-700/50 p-4 backdrop-blur-sm">
      <div className="mb-6">
        <Link
          href="/chat"
          className="w-full bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors block text-center border border-zinc-600 hover:border-zinc-500"
        >
          + New Chat
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-zinc-100">Chat History</h2>
      {chats.length === 0 ? (
        <p className="text-zinc-400 text-sm">No chats yet</p>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chat/${chat.id}`}
              className="block p-3 rounded-lg hover:bg-zinc-800/70 transition-colors border border-zinc-700/50 hover:border-zinc-600 bg-zinc-800/30"
            >
              <div className="text-sm font-medium text-zinc-100">
                {formatCreatedAt(chat.createdAt)}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                {chat.messages.length} message
                {chat.messages.length !== 1 ? "s" : ""}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
