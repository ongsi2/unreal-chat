import { z } from "zod";

export const createMessageSchema = z.object({
  content: z.string().min(1, "메시지를 입력해주세요").max(1000, "메시지는 1000자 이하여야 합니다"),
  senderId: z.string().min(1, "발신자 정보가 필요합니다"),
  roomId: z.string().min(1, "채팅방 정보가 필요합니다"),
});

// 메시지 입력 폼용 스키마 (content만)
export const messageFormSchema = z.object({
  content: z.string().min(1, "메시지를 입력해주세요").max(1000, "메시지는 1000자 이하여야 합니다"),
});

export const updateMessageSchema = z.object({
  isRead: z.boolean(),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type MessageFormInput = z.infer<typeof messageFormSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
