import ChatInterface from "@/components/chat";
import { getChatByID } from "@/lib/actions/queries";
import { auth } from "@clerk/nextjs/server";
import { UIMessage } from "ai";
import { UUID } from "crypto";
import { notFound, redirect } from "next/navigation";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: UUID }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/");

  const chatFromDb = await getChatByID({ id, userId });

  if (!chatFromDb) {
    return notFound();
  }

  if (chatFromDb.userId !== userId) {
    return notFound();
  }

  return (
    <main>
      <ChatInterface id={chatFromDb.id} initialMessages={chatFromDb.messages} />
    </main>
    // <ChatInterface id={chatFromDb.id} initialMessages={[]} />
  );
}
