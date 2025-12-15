"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { messageFormSchema, type MessageFormInput } from "@/lib/validations/message";
import { useUserStore } from "@/lib/stores/user-store";
import { useChatRoomStore } from "@/lib/stores/chatroom-store";
import { useSocket } from "@/lib/contexts/socket-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Image as ImageIcon } from "lucide-react";

export function MessageInput() {
  const { socket, isConnected } = useSocket();
  const { currentUser } = useUserStore();
  const { currentChatRoom } = useChatRoomStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<MessageFormInput>({
    resolver: zodResolver(messageFormSchema),
  });

  const contentValue = watch("content");

  // 채팅방 바뀔 때마다 입력창 초기화
  useEffect(() => {
    reset();
    setTimeout(() => setFocus("content"), 0);
  }, [currentChatRoom?.id, reset, setFocus]);

  const onSubmit = async (data: MessageFormInput) => {
    console.log("📝 메시지 전송 시도:", data);
    console.log("👤 현재 사용자:", currentUser);
    console.log("🏠 현재 채팅방:", currentChatRoom);
    console.log("🔌 Socket 연결 상태:", isConnected, socket?.connected);

    if (!currentUser || !currentChatRoom || !socket) {
      console.error("❌ 필수 정보 누락:", { currentUser, currentChatRoom, socket: !!socket });
      return;
    }

    // 메시지 전송 전에 타이핑 중지
    if (isTyping) {
      socket.emit("typing:stop", {
        roomId: currentChatRoom.id,
        userId: currentUser.id,
      });
      setIsTyping(false);
    }

    setIsSubmitting(true);
    try {
      const message = {
        id: `msg_${Date.now()}`,
        content: data.content,
        senderId: currentUser.id,
        roomId: currentChatRoom.id,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: currentUser,
      };

      console.log("📤 메시지 발송:", message);
      // Socket.io로 메시지 전송
      socket.emit("message:send", message);
      console.log("✅ 메시지 전송 완료");
      reset();
      // 입력창에 다시 포커스
      setTimeout(() => setFocus("content"), 0);
    } catch (error) {
      console.error("❌ 메시지 전송 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 타이핑 이벤트 처리 (contentValue 변화 감지)
  useEffect(() => {
    if (!socket || !currentUser || !currentChatRoom) return;

    // 입력이 있으면 타이핑 시작
    if (contentValue && contentValue.length > 0 && !isTyping) {
      console.log("🔤 타이핑 시작:", currentUser.username);
      socket.emit("typing:start", {
        roomId: currentChatRoom.id,
        userId: currentUser.id,
        username: currentUser.username,
      });
      setIsTyping(true);
    }

    // 기존 타이머 클리어
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // 2초 후에 타이핑 중지
    if (contentValue && contentValue.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        console.log("🛑 타이핑 중지 (타임아웃):", currentUser.username);
        socket.emit("typing:stop", {
          roomId: currentChatRoom.id,
          userId: currentUser.id,
        });
        setIsTyping(false);
      }, 2000);
    }
  }, [contentValue, socket, currentUser, currentChatRoom]);

  // 채팅방 변경 또는 언마운트 시 타이핑 중지
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && currentUser && currentChatRoom && isTyping) {
        socket.emit("typing:stop", {
          roomId: currentChatRoom.id,
          userId: currentUser.id,
        });
      }
    };
  }, [currentChatRoom?.id]);

  if (!currentChatRoom) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 border-t border-purple-100/50 bg-gradient-to-r from-white to-purple-50/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2">
        {/* 이모지 버튼 */}
        <div className="relative group">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-purple-100 hover:text-purple-600 transition-all hover:scale-110 shrink-0"
            onClick={() => {
              // 준비 중 알림
              alert("이모지 기능은 준비 중입니다! 🎉");
            }}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            이모지 (준비 중)
          </span>
        </div>

        {/* 파일 첨부 버튼 */}
        <div className="relative group">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-blue-100 hover:text-blue-600 transition-all hover:scale-110 shrink-0"
            onClick={() => {
              alert("파일 첨부 기능은 준비 중입니다! 📎");
            }}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            파일 첨부 (준비 중)
          </span>
        </div>

        {/* 이미지 첨부 버튼 */}
        <div className="relative group">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-pink-100 hover:text-pink-600 transition-all hover:scale-110 shrink-0"
            onClick={() => {
              alert("이미지 첨부 기능은 준비 중입니다! 🖼️");
            }}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            이미지 첨부 (준비 중)
          </span>
        </div>

        {/* 메시지 입력창 */}
        <div className="flex-1 relative">
          <Input
            {...register("content")}
            placeholder={isConnected ? "메시지를 입력하세요..." : "연결 중..."}
            disabled={isSubmitting || !isConnected}
            className="pr-3 bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 rounded-full shadow-sm transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
          />
        </div>

        {/* 전송 버튼 */}
        <Button
          type="submit"
          disabled={isSubmitting || !isConnected}
          size="icon"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95 rounded-full shrink-0 group"
        >
          <Send className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Button>
      </div>

      {/* 에러 메시지 */}
      {errors.content && (
        <div className="mt-2 px-4">
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.content.message}
          </p>
        </div>
      )}

      {/* 연결 상태 */}
      {!isConnected && (
        <div className="mt-2 px-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            서버에 연결 중...
          </p>
        </div>
      )}
    </form>
  );
}
