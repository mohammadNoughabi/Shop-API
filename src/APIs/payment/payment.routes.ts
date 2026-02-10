import express from 'express';

import paymentController from './payment.controller.ts';

import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  createPaymentSchema,
  initializePaymentSchema,
  verifyPaymentSchema,
  cancelPaymentSchema,
} from './payment.schema.ts';

const paymentRouter = express.Router();

paymentRouter.use(authenticateToken);

// CRUD operations for payment records
paymentRouter.get('/', authorizeRole(['admin']), paymentController.getAll);
paymentRouter.get('/:id', paymentController.getById);
paymentRouter.post(
  '/',
  validate(createPaymentSchema),
  paymentController.create,
);

// Payment flow operations
paymentRouter.post(
  '/:id/initialize',
  validate(initializePaymentSchema),
  paymentController.initializePayment,
);
paymentRouter.get(
  '/:id/verify',
  validate(verifyPaymentSchema),
  paymentController.verifyPayment,
);
paymentRouter.post(
  '/:id/cancel',
  validate(cancelPaymentSchema),
  paymentController.cancelPayment,
);
paymentRouter.get('/:id/status', paymentController.checkPaymentStatus);

export default paymentRouter;
