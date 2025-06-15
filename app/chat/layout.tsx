import { auth } from "@clerk/nextjs/server";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  auth.protect();
  return <>{children}</>;
}
