import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(2, "이름은 최소 2자 이상이어야 합니다")
    .max(30, "이름은 최대 30자까지 가능합니다")
    .trim(),
  email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, "비밀번호는 최소 6자 이상이어야 합니다")
    .max(100, "비밀번호는 최대 100자까지 가능합니다"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
