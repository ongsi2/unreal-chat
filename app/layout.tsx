import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/lib/contexts/socket-context";

export const metadata: Metadata = {
  title: "Real Chat - 실시간 채팅 서비스",
  description: "Node.js, Socket.io, Redis, MongoDB를 활용한 실시간 채팅 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
