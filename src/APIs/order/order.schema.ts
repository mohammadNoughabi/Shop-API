import { z, uuidv4 } from 'zod';

export const orderIdParamSchema = z.object({
  params: z.object({
    id: uuidv4(),
  }),
});

export const getOrdersSchema = z.object({
  query: z.object({
    status: z
      .enum(['pending', 'paid', 'shipped', 'delivered', 'canceled'])
      .optional(),
  }),
});

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

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>['body'];
export type GetOrdersInput = z.infer<typeof getOrdersSchema>['query'];
