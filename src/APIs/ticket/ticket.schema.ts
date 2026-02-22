import { z, uuidv4 } from 'zod';

export const getTicketByIdSchema = z.object({
  params: z.object({
    id: uuidv4(),
  }),
});

export const getUserTicketsSchema = z.object({
  params: z.object({
    userId: uuidv4(),
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
    ticketId: uuidv4(),
    message: z.string().min(1),
    attachments: z.array(z.string().url()).optional(),
  }),
});

export const closeTicketSchema = z.object({
  params: z.object({
    id: uuidv4(),
  }),
});
