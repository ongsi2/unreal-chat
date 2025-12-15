"use client";

import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "@/lib/stores/message-store";
import { useUserStore } from "@/lib/stores/user-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatRoomStore } from "@/lib/stores/chatroom-store";
import { useSocket } from "@/lib/contexts/socket-context";
import { MessageWithSender } from "@/lib/types";
import { Users, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// 사용자 ID에 따라 일관된 색상 생성
const getColorForUser = (userId: string) => {
  const colors = [
    "bg-slate-600",
    "bg-slate-700",
    "bg-gray-600",
    "bg-gray-700",
    "bg-zinc-600",
    "bg-stone-600",
  ];
  const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export function MessageList() {
  const { messages, addMessage, clearMessages } = useMessageStore();
  const { currentUser } = useUserStore();
  const { currentChatRoom, setCurrentChatRoom } = useChatRoomStore();
  const { socket } = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [roomUserCount, setRoomUserCount] = useState<number>(1);
  const prevChatRoomIdRef = useRef<string | null>(null);

  // 채팅방 나가기 핸들러
  const handleLeaveChatRoom = async () => {
    if (!currentChatRoom || !currentUser) return;

    const confirm = window.confirm(`"${currentChatRoom.name}" 채팅방에서 나가시겠습니까?`);
    if (!confirm) return;

    try {
      // 소켓으로 먼저 나가기
      if (socket) {
        socket.emit("room:leave", {
          roomId: currentChatRoom.id,
          userId: currentUser.id,
          username: currentUser.username,
        });
      }

      // 서버에 나가기 요청 (MongoDB participants에서 제거)
      const response = await fetch(`/api/chatrooms/${currentChatRoom.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (response.ok) {
        console.log("✅ 채팅방 나가기 성공");
        // 현재 채팅방 초기화
        setCurrentChatRoom(null);
        clearMessages();

        // 채팅방 목록 다시 불러오기
        const token = useUserStore.getState().token;
        if (token) {
          const chatRoomsRes = await fetch("/api/chatrooms", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (chatRoomsRes.ok) {
            const { chatRooms } = await chatRoomsRes.json();
            useChatRoomStore.getState().setChatRooms(chatRooms);
          }
        }
      } else {
        console.error("❌ 채팅방 나가기 실패");
        alert("채팅방에서 나가는데 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 채팅방 나가기 에러:", error);
      alert("채팅방에서 나가는데 실패했습니다.");
    }
  };

  // 메시지 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 채팅방 변경 시 이전 방 나가기 처리
  useEffect(() => {
    if (!socket || !currentChatRoom || !currentUser) return;

    // 이전 채팅방이 있으면 나가기
    if (prevChatRoomIdRef.current && prevChatRoomIdRef.current !== currentChatRoom.id) {
      console.log("🚪 이전 채팅방 나가기:", prevChatRoomIdRef.current);
      socket.emit("room:leave", {
        roomId: prevChatRoomIdRef.current,
        userId: currentUser.id,
        username: currentUser.username,
      });
    }

    // 새 채팅방 참가
    console.log("🚪 채팅방 참가 요청:", {
      roomId: currentChatRoom.id,
      userId: currentUser.id,
      username: currentUser.username,
    });
    socket.emit("room:join", {
      roomId: currentChatRoom.id,
      userId: currentUser.id,
      username: currentUser.username,
    });

    // 현재 채팅방 ID 저장
    prevChatRoomIdRef.current = currentChatRoom.id;

    // 컴포넌트 언마운트 시 채팅방 나가기
    return () => {
      if (currentChatRoom && currentUser && socket) {
        console.log("🧹 컴포넌트 언마운트: 채팅방 나가기", currentChatRoom.id);
        socket.emit("room:leave", {
          roomId: currentChatRoom.id,
          userId: currentUser.id,
          username: currentUser.username,
        });
      }
    };
  }, [socket, currentChatRoom?.id, currentUser]);

  // Socket.io 이벤트 리스너
  useEffect(() => {
    if (!socket || !currentChatRoom) {
      console.log("⚠️ Socket 또는 채팅방 없음:", { socket: !!socket, currentChatRoom: !!currentChatRoom });
      return;
    }

    console.log("🔌 Socket.io 이벤트 리스너 설정:", currentChatRoom.id);

    // 메시지 수신
    const handleMessageReceive = (message: MessageWithSender) => {
      console.log("📨 메시지 수신:", message);
      if (message.roomId === currentChatRoom.id) {
        console.log("✅ 메시지 추가:", message);
        addMessage(message);
      } else {
        console.log("⚠️ 다른 채팅방 메시지:", message.roomId, "현재:", currentChatRoom.id);
      }
    };

    // 채팅방 유저 수 업데이트
    const handleRoomUserCount = ({ roomId, count }: { roomId: string; count: number }) => {
      if (roomId === currentChatRoom.id) {
        console.log("👥 채팅방 유저 수 업데이트:", count);
        setRoomUserCount(count);
      }
    };

    socket.on("message:receive", handleMessageReceive);
    socket.on("room:user-count", handleRoomUserCount);
    console.log("👂 Socket 이벤트 리스너 등록 완료");

    // 클린업
    return () => {
      console.log("🧹 Socket.io 이벤트 리스너 정리");
      socket.off("message:receive", handleMessageReceive);
      socket.off("room:user-count", handleRoomUserCount);
    };
  }, [socket, currentChatRoom, currentUser, addMessage]);

  // 채팅방 변경 시 메시지 로드 및 읽음 처리
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentChatRoom || !currentUser) return;

      clearMessages();
      console.log("📥 메시지 로드 시작:", currentChatRoom.id);

      // 읽지 않은 메시지 수 초기화
      useChatRoomStore.getState().resetUnreadCount(currentChatRoom.id);

      try {
        const response = await fetch(`/api/messages?roomId=${currentChatRoom.id}`);
        if (response.ok) {
          const { messages: loadedMessages } = await response.json();
          console.log("✅ 메시지 로드 완료:", loadedMessages.length, "개");
          loadedMessages.forEach((msg: MessageWithSender) => addMessage(msg));

          // 읽지 않은 메시지들을 읽음 처리
          const unreadMessages = loadedMessages.filter(
            (msg: MessageWithSender) =>
              !msg.readBy?.includes(currentUser.id) && msg.senderId !== currentUser.id
          );

          if (unreadMessages.length > 0 && socket) {
            console.log("👁️ 읽음 처리:", unreadMessages.length, "개");
            unreadMessages.forEach((msg: MessageWithSender) => {
              socket.emit("message:read", {
                messageId: msg.id,
                roomId: currentChatRoom.id,
                userId: currentUser.id,
              });
            });
          }
        } else {
          console.error("❌ 메시지 로드 실패:", response.status);
        }
      } catch (error) {
        console.error("❌ 메시지 로드 에러:", error);
      }
    };

    loadMessages();
  }, [currentChatRoom?.id, currentUser, socket, clearMessages, addMessage]);

  if (!currentChatRoom) {
    return (
      <Card className="h-full flex items-center justify-center bg-white border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="inline-flex p-6 rounded-full bg-slate-100 mb-4">
            <Users className="h-12 w-12 text-slate-400" />
          </div>
          <p className="text-muted-foreground font-medium">채팅방을 선택해주세요</p>
          <p className="text-xs text-muted-foreground mt-2">왼쪽에서 채팅방을 선택하여 대화를 시작하세요</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-white font-bold">
                {currentChatRoom.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">{currentChatRoom.name}</CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {roomUserCount}명 온라인
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeaveChatRoom}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-1" />
            나가기
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 bg-slate-50">
        <ScrollArea className="h-[calc(100vh-16rem)] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  메시지가 없습니다
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  첫 메시지를 보내보세요!
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isCurrentUser = message.senderId === currentUser?.id;
                const color = getColorForUser(message.senderId);
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${
                      isCurrentUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="w-8">
                      {!isCurrentUser && showAvatar && (
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
                          <span className="text-white font-bold text-xs">
                            {message.sender.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className={`flex flex-col max-w-[70%] ${
                        isCurrentUser ? "items-end" : ""
                      }`}
                    >
                      {showAvatar && !isCurrentUser && (
                        <p className="text-xs font-medium text-gray-600 mb-1 px-1">
                          {message.sender.username}
                        </p>
                      )}

                      <div className="flex items-end gap-2">
                        {isCurrentUser && (
                          <span className="text-xs text-gray-500 self-end">
                            {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            isCurrentUser
                              ? "bg-slate-900 text-white rounded-br-sm"
                              : "bg-white border border-slate-200 text-gray-800 rounded-bl-sm"
                          }`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        </div>

                        {!isCurrentUser && (
                          <span className="text-xs text-gray-500 self-end">
                            {new Date(message.createdAt).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-8"></div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
