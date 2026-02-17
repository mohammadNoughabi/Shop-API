import { z } from 'zod';

// Reusable primitives
const usernameSchema = z.string().trim().min(5).max(50);
const emailSchema = z.string().trim().email().optional();
const passwordSchema = z.string().trim().min(8);

// ================= REGISTER =================
const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

// ================= LOGIN =================
const loginSchema = z.object({
  body: z.object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema,
  }),
});

// ================= FORGOT PASSWORD =================
const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

// ================= RESET PASSWORD =================
const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: passwordSchema,
  }),
});

export {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'] & {
  id: string;
};
