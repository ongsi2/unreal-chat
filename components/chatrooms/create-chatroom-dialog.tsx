"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { chatRoomFormSchema, type ChatRoomFormInput } from "@/lib/validations/chatroom";
import { useChatRoomStore } from "@/lib/stores/chatroom-store";
import { useUserStore } from "@/lib/stores/user-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateChatRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChatRoomDialog({ open, onOpenChange }: CreateChatRoomDialogProps) {
  const { addChatRoom } = useChatRoomStore();
  const { currentUser } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatRoomFormInput>({
    resolver: zodResolver(chatRoomFormSchema),
  });

  const onSubmit = async (data: ChatRoomFormInput) => {
    if (!currentUser) return;

    console.log("🏠 채팅방 생성 시도:", data);

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/chatrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          participants: [currentUser.id],
        }),
      });

      if (response.ok) {
        const { chatRoom } = await response.json();
        console.log("✅ 채팅방 생성 완료:", chatRoom);
        addChatRoom(chatRoom);
        reset();
        onOpenChange(false);
      } else {
        console.error("❌ 채팅방 생성 실패:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("❌ 채팅방 생성 에러:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 채팅방 만들기</DialogTitle>
          <DialogDescription>
            새로운 채팅방을 만들어보세요
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              채팅방 이름
            </label>
            <Input
              id="name"
              {...register("name")}
              placeholder="채팅방 이름을 입력하세요"
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "생성하기"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
