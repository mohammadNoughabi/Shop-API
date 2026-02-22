import { z, uuidv4 } from 'zod';

const usernameSchema = z.string().trim().min(5).max(50);
const emailSchema = z.string().trim().pipe(z.email()).optional();
const passwordSchema = z.string().trim().min(8);

export const userIdParamSchema = z.object({
  params: z.object({
    id: uuidv4(),
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
    id: uuidv4(),
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
