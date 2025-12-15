"use client";

import { useState } from "react";
import { useChatRoomStore } from "@/lib/stores/chatroom-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Users } from "lucide-react";
import { CreateChatRoomDialog } from "./create-chatroom-dialog";

// 방 ID에 따라 일관된 색상 생성
const getColorForRoom = (roomId: string) => {
  const colors = [
    "bg-slate-600",
    "bg-slate-700",
    "bg-slate-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-zinc-600",
  ];
  const index = roomId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
};

export function ChatRoomList() {
  const { chatRooms, currentChatRoom, setCurrentChatRoom } = useChatRoomStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 디버깅: chatRooms 변경 확인
  console.log("📋 채팅방 목록:", chatRooms.map(r => ({ name: r.name, unreadCount: r.unreadCount })));

  return (
    <>
      <Card className="h-full bg-white border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 rounded-lg bg-slate-900">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              채팅방 목록
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-1 bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              새 채팅방
            </Button>
          </div>
        </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2 p-4">
            {chatRooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
                  <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm text-muted-foreground">
                  채팅방이 없습니다
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  새 채팅방을 만들어보세요
                </p>
              </div>
            ) : (
              chatRooms.map((room) => {
                const isActive = currentChatRoom?.id === room.id;
                const color = getColorForRoom(room.id);

                return (
                  <div
                    key={room.id}
                    onClick={() => setCurrentChatRoom(room)}
                    className={`group relative p-4 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? "bg-slate-100 border-2 border-slate-900"
                        : "hover:bg-slate-50 border-2 border-transparent"
                    }`}
                  >
                    <div className="relative flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
                          <span className="text-white font-semibold text-lg">
                            {room.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold truncate ${isActive ? "text-slate-900" : ""}`}>
                            {room.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{room.participants.length}명 참여 중</span>
                        </div>
                      </div>

                      {room.unreadCount > 0 && (
                        <div className="bg-red-500 text-white rounded-full h-6 min-w-[1.5rem] px-2 flex items-center justify-center text-xs font-semibold">
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>

    <CreateChatRoomDialog
      open={isCreateDialogOpen}
      onOpenChange={setIsCreateDialogOpen}
    />
    </>
  );
}
