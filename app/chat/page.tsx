import ChatInterface from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default function Chat() {
  const id = generateUUID();

  return (
    <main className="flex flex-col min-h-screen w-full">
      <ChatInterface key={id} id={id} initialMessages={[]} isNewChat={true} />
    </main>
  );
}
