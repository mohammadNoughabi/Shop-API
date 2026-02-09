import { Router } from 'express';
import orderController from './order.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';
import validate from '../../middlewares/zod.validation.ts';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamSchema,
} from './order.schema.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', orderController.getMyOrders);
router.get('/:id', validate(orderIdParamSchema), orderController.getById);
router.post('/', validate(createOrderSchema), orderController.create);
router.patch(
  '/:id/status',
  authorizeRole(['admin']),
  validate(updateOrderStatusSchema),
  orderController.updateStatus,
);
router.delete('/:id', validate(orderIdParamSchema), orderController.softDelete);

export default router;
