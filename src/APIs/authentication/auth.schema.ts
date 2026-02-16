import { z } from 'zod';

const usernameSchema = z.string().trim().min(5).max(15);

const emailSchema = z.email().optional();

const passwordSchema = z.string().trim().min(8);

const registerSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});

const loginSchema = z.object({
  body: z.object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema,
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    userId: z.string(),
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

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
