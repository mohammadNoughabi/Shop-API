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
  .max(2000);

const price = z.string().trim().min(1, 'Price can not be empty');

const stock = z.number().int();

const category = z.string().trim().min(1, 'Category can not be null');

/**
 * CREATE
 * image and gallery come from multer, not body
 */
export const createProductSchema = z.object({
  body: z.object({
    title,
    description,
    price,
    stock,
    category,
  }),
});

/**
 * UPDATE
 * All fields optional
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id'),
  }),
  body: z.object({
    title,
    description,
    price,
    stock,
    category,
  }),
});

/**
 * PARAMS (getById, delete)
 */
export const productIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id'),
  }),
});

/**
 * Types inferred from Zod
 */
export type CreateProductInput = z.infer<typeof createProductSchema>['body'] & {
  image: string;
  gallery: string[];
};

export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
