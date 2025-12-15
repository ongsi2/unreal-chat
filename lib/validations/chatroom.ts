import { z } from "zod";

export const createChatRoomSchema = z.object({
  name: z.string().min(1, "채팅방 이름을 입력해주세요").max(50, "채팅방 이름은 50자 이하여야 합니다"),
  participants: z.array(z.string()).min(1, "최소 1명 이상의 참가자가 필요합니다"),
});

// 채팅방 생성 폼용 스키마 (name만)
export const chatRoomFormSchema = z.object({
  name: z.string().min(1, "채팅방 이름을 입력해주세요").max(50, "채팅방 이름은 50자 이하여야 합니다"),
});

export const updateChatRoomSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  isActive: z.boolean().optional(),
});

export type CreateChatRoomInput = z.infer<typeof createChatRoomSchema>;
export type ChatRoomFormInput = z.infer<typeof chatRoomFormSchema>;
export type UpdateChatRoomInput = z.infer<typeof updateChatRoomSchema>;
