import express from 'express';

import cartController from './cart.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  addCartItemInput,
  initializeCartInput,
  removeCartItemInput,
} from './cart.schema.ts';

const cartRouter = express.Router();

cartRouter.use(authenticateToken);

cartRouter.post(
  '/initialize',
  validate(initializeCartInput),
  cartController.initialize,
);
cartRouter.post(
  '/add-item',
  validate(addCartItemInput),
  cartController.addItem,
);
cartRouter.post(
  '/remove-item',
  validate(removeCartItemInput),
  cartController.removeItem,
);

export default cartRouter;
