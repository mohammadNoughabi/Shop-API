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

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)'),
});

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
  files: z
    .object({
      image: z.array(multerFileSchema).min(1, 'Main image is required'),
      gallery: z.array(multerFileSchema).optional().default([]),
    })
    .refine((files) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const allFiles = [...files.image, ...files.gallery];
      return allFiles.every((file) => allowedTypes.includes(file.mimetype));
    }, 'Invalid file format. Only JPEG , JPG and PNG are allowed.'),
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
  files: z
    .object({
      image: z.array(multerFileSchema).min(1).optional().default([]),
      gallery: z.array(multerFileSchema).optional().default([]),
    })
    .optional()
    .refine((files) => {
      if (!files) return true; // no files is fine for update
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      const allFiles = [...files.image, ...files.gallery];
      return allFiles.every((file) => allowedTypes.includes(file.mimetype));
    }, 'Invalid file format. Only JPEG , JPG and PNG are allowed.'),
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
export type CreateProductBody = z.infer<typeof createProductSchema>['body'];

export type UpdateProductBody = z.infer<typeof updateProductSchema>['body'];
