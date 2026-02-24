import express from 'express';

// middelwares
import upload from '../../middlewares/upload.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';
import validate from '../../middlewares/zod.validation.ts';

// zod schemas
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  productSlugParamSchema,
} from './product.schema.ts';

// controllers
import productController from './product.controller.ts';

const productRouter = express.Router();

productRouter.get('/', productController.getAll);
productRouter.get(
  '/:id',
  validate(productIdParamSchema),
  productController.getById,
);
productRouter.get(
  '/slug/:slug',
  validate(productSlugParamSchema),
  productController.getBySlug,
);
productRouter.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery' }]),
  validate(createProductSchema),
  productController.create,
);
productRouter.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery' }]),
  validate(updateProductSchema),
  productController.update,
);
productRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validate(productIdParamSchema),
  productController.delete,
);

productRouter.post(
  '/:id/restore',
  authenticateToken,
  authorizeRole(['admin']),
  validate(productIdParamSchema),
  productController.restore,
);

export default productRouter;
