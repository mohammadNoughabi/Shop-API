import express from 'express';

import otpController from './otp.controller.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  generateOtpSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './otp.schema.ts';

const otpRouter = express.Router();

otpRouter.post(
  '/generate',
  validate(generateOtpSchema),
  otpController.generate,
);
otpRouter.post('/send', validate(sendOtpSchema), otpController.send);
otpRouter.post('/verify', validate(verifyOtpSchema), otpController.verify);

export default otpRouter;
