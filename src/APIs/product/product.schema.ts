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
  .max(2000);

const price = z.coerce.number().positive('Price must be a positive number');

const stock = z.coerce.number();

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid MongoDB ObjectId');

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
    categoryId: objectId,
  }),
});

/**
 * UPDATE
 * All fields optional
 */
export const updateProductSchema = z.object({
  params: z.object({
    id: uuidv4('Product ID must be a valid UUID'),
  }),
  body: z.object({
    title: title.optional(),
    description: description.optional(),
    price: price.optional(),
    stock: stock.optional(),
    categoryId: objectId.optional(),
  }),
});

/**
 * PARAMS (getById, delete)
 */
export const productIdParamSchema = z.object({
  params: z.object({
    id: uuidv4('Product ID must be a valid UUID'),
  }),
});

export const productSlugParamSchema = z.object({
  params: z.object({
    slug: z.string().trim().min(1, 'Slug is required'),
  }),
});

/**
 * Types inferred from Zod
 */
export type CreateProductInput = z.infer<typeof createProductSchema>['body'] & {
  id: string;
  image: string;
  gallery: string[];
};

export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'] & {
  image?: string;
  gallery?: string[];
};
