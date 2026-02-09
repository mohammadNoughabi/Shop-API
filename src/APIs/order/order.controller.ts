import type { Request, Response } from 'express';
import orderService from './order.service.ts';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from './order.interface.ts';

class OrderController {
  async getMyOrders(req: Request, res: Response) {
    const orders = await orderService.getMyOrders(req.user._id as string);
    res.json({ success: true, data: { orders } });
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const order = await orderService.getOrderById(id, req.user._id as string);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  }

  async create(req: Request, res: Response) {
    const data = req.body as CreateOrderInput;
    const order = await orderService.createOrderFromCart(
      req.user._id as string,
      data,
    );
    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order creation failed',
      });
    }
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order },
    });
  }

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body as UpdateOrderStatusInput;
    const order = await orderService.updateStatus(id, status);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    return res.json({
      success: true,
      message: 'Status updated',
      data: { order },
    });
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id as string;
    const order = await orderService.softDelete(id, req.user._id as string);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or cannot be canceled',
      });
    }

    return res.json({ success: true, message: 'Order canceled successfully' });
  }
}

export default new OrderController();
