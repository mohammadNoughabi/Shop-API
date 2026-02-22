import { z, uuidv4 } from 'zod';

export const submitSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(2000),
  }),
  query: z.object({
    productId: uuidv4(),
  }),
});

export const doLikeSchema = z.object({
  query: z.object({
    commentId: uuidv4(),
  }),
});

export const doDislikeSchema = z.object({
  query: z.object({
    commentId: uuidv4(),
  }),
});

export const undoLikeSchema = z.object({
  query: z.object({
    commentId: uuidv4(),
  }),
});

export const undoDislikeSchema = z.object({
  query: z.object({
    commentId: uuidv4(),
  }),
});

export type SubmitCommentSchema = z.infer<typeof submitSchema>;
