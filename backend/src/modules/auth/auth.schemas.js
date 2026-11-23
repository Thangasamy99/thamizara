import { z } from "zod";

export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a digit");

export const loginSchema = z.object({
  email: z.string().trim().email().max(190),
  password: z.string().min(1, "Password is required").max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordRule,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(190),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordRule,
});
