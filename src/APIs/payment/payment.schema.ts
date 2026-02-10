import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ObjectId format',
});

export const createPaymentSchema = z.object({
  body: z.object({
    description: z.string().trim().min(1, 'Description is required'),
    email: z.email('Invalid email').optional(),
    phone: z
      .string()
      .trim()
      .min(10, 'Phone number is too short')
      .max(15, 'Phone number is too long')
      .optional(),
  }),
  query: z.object({
    orderId: objectIdSchema,
  }),
});

export const initializePaymentSchema = z.object({
  params: z.object({
    paymentId: objectIdSchema,
  }),
  query: z.object({
    callbackUrl: z.url('Invalid callback URL'),
  }),
});

export const verifyPaymentSchema = z.object({
  query: z.object({
    authority: z.string().trim().min(1, 'Authority is required'),
    amount: z.string().trim().min(1, 'Amount is required'),
  }),
});

export const cancelPaymentSchema = z.object({
  params: z.object({
    paymentId: objectIdSchema,
  }),
});

export interface CreatePaymentInput {
  metadata: z.infer<typeof createPaymentSchema>['body'];
}

export type InitializePaymentInput = z.infer<
  typeof initializePaymentSchema
>['params'] &
  z.infer<typeof initializePaymentSchema>['query'];

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>['query'];
