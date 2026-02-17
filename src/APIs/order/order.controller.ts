import type { Request, Response } from 'express';
import orderService from './order.service.ts';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
} from './order.interface.ts';

class OrderController {
  async getMyOrders(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const result = await orderService.getMyOrders(userId);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;
    const userId = req.user._id as string;
    const result = await orderService.getOrderById(id, userId);

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const data = req.body as CreateOrderInput;
    const userId = req.user._id as string;
    const result = await orderService.createOrderFromCart(userId, data);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async updateStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body as UpdateOrderStatusInput;
    const result = await orderService.updateStatus(id, status);

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async softDelete(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.user._id as string;
    const result = await orderService.softDelete(id, userId);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new OrderController();
