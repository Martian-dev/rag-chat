import ChatInterface from "@/components/chat";
import { generateUUID } from "@/lib/utils";

export default function Chat() {
  const id = generateUUID();

  return (
    <main>
      <ChatInterface key={id} id={id} initialMessages={[]} />
    </main>
  );
}
