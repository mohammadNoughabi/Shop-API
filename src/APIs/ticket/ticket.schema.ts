import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const getTicketByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getUserTicketsSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(10),
    // userId will usually come from the authenticated req.user, not the body
  }),
});

export const addMessageSchema = z.object({
  body: z.object({
    ticketId: objectIdSchema,
    message: z.string().min(1),
    attachments: z.array(z.string().url()).optional(),
  }),
});

export const closeTicketSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
