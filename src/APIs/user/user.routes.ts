import express from 'express';

import userController from './user.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import validate from '../../middlewares/zod.validation.ts';
import { createUserSchema, updatePasswordSchema } from './user.schema.ts';

const userRouter = express.Router();

userRouter.get('/profile', authenticateToken, userController.getProfile);
userRouter.post(
  '/create',
  validate(createUserSchema),
  userController.createUser,
);
userRouter.put(
  '/update-password',
  authenticateToken,
  validate(updatePasswordSchema),
  userController.updatePassword,
);
userRouter.post(
  '/delete-account',
  authenticateToken,
  userController.deleteAccount,
);

export default userRouter;
