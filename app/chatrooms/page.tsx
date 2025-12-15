"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatRoomStore } from "@/lib/stores/chatroom-store";
import { useUserStore } from "@/lib/stores/user-store";
import { useSocket } from "@/lib/contexts/socket-context";
import { ChatRoomList } from "@/components/chatrooms/chat-room-list";
import { MessageList } from "@/components/messages/message-list";
import { MessageInput } from "@/components/messages/message-input";
import { MessageCircle, LogOut } from "lucide-react";

export default function ChatRoomsPage() {
  const router = useRouter();
  const { setChatRooms } = useChatRoomStore();
  const { currentUser, token, logout, _hasHydrated } = useUserStore();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    // hydration 완료될 때까지 대기
    if (!_hasHydrated) {
      return;
    }

    // 로그인 확인
    if (!currentUser || !token) {
      router.push("/auth/login");
      return;
    }

    // 초기 데이터 로드
    const loadInitialData = async () => {
      try {
        // 채팅방 목록 로드
        const chatRoomsRes = await fetch("/api/chatrooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (chatRoomsRes.ok) {
          const { chatRooms } = await chatRoomsRes.json();
          setChatRooms(chatRooms);
        }
      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
      }
    };

    loadInitialData();
  }, [currentUser, token, _hasHydrated, setChatRooms, router]);

  // Socket.io 사용자 로그인
  useEffect(() => {
    if (socket && isConnected && currentUser) {
      socket.emit("user:login", {
        userId: currentUser.id,
        username: currentUser.username,
      });
    }
  }, [socket, isConnected, currentUser]);

  // 서버에서 보낸 unread count 증가 이벤트 수신
  useEffect(() => {
    if (!socket) return;

    const handleUnreadIncrement = ({ roomId }: { roomId: string }) => {
      console.log("🔔 unread:increment 이벤트 수신:", roomId);
      useChatRoomStore.getState().incrementUnreadCount(roomId);
    };

    socket.on("unread:increment", handleUnreadIncrement);

    return () => {
      socket.off("unread:increment", handleUnreadIncrement);
    };
  }, [socket]);

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("로그아웃 에러:", error);
    } finally {
      // 로컬 상태 초기화
      logout();
      router.push("/auth/login");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="p-2 rounded-lg bg-slate-900">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Real Chat
            </h1>
          </a>
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.username}
                </p>
                <p className="text-xs text-gray-600">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <LogOut className="h-3 w-3" />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-1">
              <ChatRoomList />
            </div>
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex-1 overflow-hidden">
                <MessageList />
              </div>
              <MessageInput />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
