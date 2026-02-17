import express from 'express';

import authController from './auth.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.ts';

const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/logout', authenticateToken, authController.logout);
authRouter.post(
  '/forgot-pass',
  authenticateToken,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  '/reset-pass/',
  authenticateToken,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;
