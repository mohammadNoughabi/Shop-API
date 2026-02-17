import express from 'express';

import userController from './user.controller.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  createUserSchema,
  updatePasswordSchema,
  userIdParamSchema,
} from './user.schema.ts';

const userRouter = express.Router();

userRouter.get(
  '/profile/:id',
  validate(userIdParamSchema),
  userController.getProfile,
);
userRouter.post(
  '/create',
  validate(createUserSchema),
  userController.createUser,
);
userRouter.put(
  '/update-password/:id',
  validate(updatePasswordSchema),
  userController.updatePassword,
);
userRouter.post(
  '/delete-account/:id',
  validate(userIdParamSchema),
  userController.deleteAccount,
);

export default userRouter;
