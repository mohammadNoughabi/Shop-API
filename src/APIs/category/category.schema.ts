import { z } from 'zod';

const title = z
  .string()
  .trim()
  .min(1, 'Title is required')
  .max(100, 'Title is too long');

const description = z
  .string()
  .trim()
  .min(1, 'Description is required')
  .max(500, 'Description is too long');

/**
 * CREATE
 * thumbnail comes from multer, not body
 */
export const createCategorySchema = z.object({
  body: z.object({
    title,
    description,
  }),
});

/**
 * UPDATE
 * All fields optional
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id'),
  }),
  body: z.object({
    title: title.optional(),
    description: description.optional(),
  }),
});

/**
 * PARAMS (getById, delete)
 */
export const categoryIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id'),
  }),
});

/**
 * Types inferred from Zod
 */
export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>['body'] & { thumbnail: string };

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
