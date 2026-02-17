import { z } from 'zod';

const usernameSchema = z.string().trim().min(5).max(50);
const emailSchema = z.string().trim().email().optional();
const passwordSchema = z.string().trim().min(8);

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
  }),
});
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const updatePasswordSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    newPassword: passwordSchema,
  }),
});
export type UpdatePasswordInput = z.infer<
  typeof updatePasswordSchema
>['body'] & {
  id: string;
};
