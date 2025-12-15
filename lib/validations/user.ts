import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(2, "사용자명은 2자 이상이어야 합니다").max(20, "사용자명은 20자 이하여야 합니다"),
  email: z.string().email("올바른 이메일 형식이 아닙니다"),
  avatar: z.string().url("올바른 URL 형식이 아닙니다").optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(2).max(20).optional(),
  avatar: z.string().url().optional(),
  isOnline: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
