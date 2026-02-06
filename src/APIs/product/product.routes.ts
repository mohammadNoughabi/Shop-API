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
} from './product.schema.ts';

// controllers
import productController from './product.controller.ts';

const productRouter = express.Router();

productRouter.get('/', productController.getAll);
productRouter.get('/:id', productController.getById);
productRouter.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  validate(createProductSchema),
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gallery' }]),
  productController.create,
);
productRouter.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
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

export default productRouter;
