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
  categorySlugParamSchema,
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

categoryRouter.get(
  '/slug/:slug',
  validate(categorySlugParamSchema),
  categoryController.getBySlug,
);

categoryRouter.post(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  upload.single('thumbnail'),
  validate(createCategorySchema),
  categoryController.create,
);

categoryRouter.put(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  upload.single('thumbnail'),
  validate(updateCategorySchema),
  categoryController.update,
);

categoryRouter.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  validate(categoryIdParamSchema),
  categoryController.delete,
);

categoryRouter.post(
  '/:id/restore',
  authenticateToken,
  authorizeRole(['admin']),
  validate(categoryIdParamSchema),
  categoryController.restore,
);

export default categoryRouter;
