import express from 'express';

import cartController from './cart.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  addCartItemSchema,
  initializeCartSchema,
  removeCartItemSchema,
} from './cart.schema.ts';

const cartRouter = express.Router();

cartRouter.use(authenticateToken);

cartRouter.post(
  '/initialize',
  validate(initializeCartSchema),
  cartController.initialize,
);
cartRouter.post(
  '/add-item',
  validate(addCartItemSchema),
  cartController.addItem,
);
cartRouter.post(
  '/remove-item',
  validate(removeCartItemSchema),
  cartController.removeItem,
);

export default cartRouter;
