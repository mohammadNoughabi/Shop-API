import { z } from 'zod';

export const cartItemSchema = z.object({
  product: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: 'Product must be a valid 24-character MongoDB ObjectId',
    }),
  price: z
    .number()
    .int()
    .positive({ message: 'Price must be a positive integer' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }),
});

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ObjectId format',
});

// For query params / route params
export const cartIdParam = z.object({
  id: objectIdSchema,
});

export const userIdParam = z.object({
  userId: objectIdSchema,
});

export const initializeCartSchema = z.object({
  body: z.object({
    userId: objectIdSchema,
  }),
});

export const addCartItemSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: z.number().int().min(1).max(50).default(1),
  }),
});

export const removeCartItemSchema = z.object({
  body: z.object({
    productId: objectIdSchema,
    quantity: z.number().int().min(1).max(50).optional(), // optional → default remove all
  }),
});

export type InitializeCartInput = z.infer<typeof initializeCartSchema>['body'];
export type AddCartItemInput = z.infer<typeof addCartItemSchema>['body'];
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>['body'];
