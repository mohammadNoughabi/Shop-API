import express from 'express';

// middlewares
import upload from '../../middlewares/upload.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';
import validate from '../../middlewares/zod.validation.ts';

// zod schemas
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './category.schema.ts';

// controller
import categoryController from './category.controller.ts';

const categoryRouter = express.Router();

categoryRouter.get('/', categoryController.getAll);

categoryRouter.get(
  '/:id',
  validate(categoryIdParamSchema),
  categoryController.getById,
);

categoryRouter.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  validate(createCategorySchema),
  upload.single('thumbnail'),
  categoryController.create,
);

categoryRouter.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validate(updateCategorySchema),
  upload.single('thumbnail'),
  categoryController.update,
);

categoryRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validate(categoryIdParamSchema),
  categoryController.delete,
);

export default categoryRouter;
