import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    address: z.string().trim().min(5, 'Address is too short'),
    postalCode: z.string().trim().min(3, 'Invalid postal code'),
    phone: z
      .string()
      .trim()
      // eslint-disable-next-line no-useless-escape
      .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number')
      .min(8),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'canceled']),
  }),
});

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ObjectId format',
});

export const orderIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
