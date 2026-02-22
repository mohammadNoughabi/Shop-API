import { z, uuidv4 } from 'zod';

// For query params / route params
export const cartIdParam = z.object({
  id: uuidv4(),
});

export const userIdParam = z.object({
  userId: uuidv4(),
});

export const addCartItemSchema = z.object({
  body: z.object({
    productId: uuidv4(),
    quantity: z.number().int().min(1).max(50).default(1),
  }),
});

export const removeCartItemSchema = z.object({
  body: z.object({
    productId: uuidv4(),
    quantity: z.number().int().min(1).max(50).optional(), // optional → default remove all
  }),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'] & {
  userId: string;
};
export type RemoveCartItemInput = z.infer<
  typeof removeCartItemSchema
>['body'] & { userId: string };
