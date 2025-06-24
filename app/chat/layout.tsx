import SideNav from "@/components/ui/sidenav";
import { auth } from "@clerk/nextjs/server";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  auth.protect();
  return (
    <div className="flex h-full">
      <SideNav />
      <div className="flex-1 flex justify-center">
        {children}
      </div>
    </div>
  );
}
