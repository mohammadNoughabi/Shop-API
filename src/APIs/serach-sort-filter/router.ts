import express from 'express';

import searchSortFilterController from './controller.ts';
import validate from '../../middlewares/zod.validation.ts';
import { productQuerySchema } from './zod.schema.ts';

const router = express.Router();

router.post(
  '/search',
  validate(productQuerySchema),
  searchSortFilterController.search,
);

export default router;
