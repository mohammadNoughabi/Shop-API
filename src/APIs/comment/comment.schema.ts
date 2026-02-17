import { z } from 'zod';

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId format');

export const submitSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
  query: z.object({
    productId: objectIdSchema,
  }),
});

export const doLikeSchema = z.object({
  query: z.object({
    commentId: objectIdSchema,
  }),
});

export const doDislikeSchema = z.object({
  query: z.object({
    commentId: objectIdSchema,
  }),
});

export const undoLikeSchema = z.object({
  query: z.object({
    commentId: objectIdSchema,
  }),
});

export const undoDislikeSchema = z.object({
  query: z.object({
    commentId: objectIdSchema,
  }),
});

export type SubmitCommentSchema = z.infer<typeof submitSchema>;
