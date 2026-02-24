import { z, uuidv4 } from 'zod';

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

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)'),
});

/**
 * CREATE
 * thumbnail comes from multer, not body
 */
export const createCategorySchema = z.object({
  body: z.object({
    title,
    description,
  }),
  file: multerFileSchema,
});

/**
 * UPDATE
 * All fields optional
 */
export const updateCategorySchema = z.object({
  params: z.object({
    id: uuidv4(),
  }),
  body: z.object({
    title: title.optional(),
    description: description.optional(),
  }),
  file: multerFileSchema.optional(),
});

/**
 * PARAMS (getById, delete)
 */
export const categoryIdParamSchema = z.object({
  params: z.object({
    id: uuidv4(),
  }),
});

export const categorySlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Slug is required'),
  }),
});

/**
 * Types inferred from Zod
 */
export type CreateCategoryBody = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryBody = z.infer<typeof updateCategorySchema>['body'];
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>['params'];
export type CategorySlugParam = z.infer<
  typeof categorySlugParamSchema
>['params'];
