import express from 'express';

import paymentController from './payment.controller.ts';

import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';

const paymentRouter = express.Router();

// CRUD operations for payment records
paymentRouter.get(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  paymentController.getAll,
);
paymentRouter.get('/:id', authenticateToken, paymentController.getById);
paymentRouter.post('/', authenticateToken, paymentController.create);

// Payment flow operations
paymentRouter.post(
  '/:id/initialize',
  authenticateToken,
  paymentController.initializePayment,
);
paymentRouter.get('/:id/verify', paymentController.verifyPayment);
paymentRouter.post(
  '/:id/cancel',
  authenticateToken,
  paymentController.cancelPayment,
);
paymentRouter.get(
  '/:id/status',
  authenticateToken,
  paymentController.checkPaymentStatus,
);

export default paymentRouter;
