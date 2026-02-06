import { ORDER_STATUSES, ORDER_STATUS_FLOW } from './order.constants.ts';
import type { OrderStatus } from './order.constants.ts';
import type { CreateOrderDto, UpdateOrderDto } from './order.interface.ts';
import type { Request, Response } from 'express';

import orderService from './order.service.ts';

class OrderController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const orders = await orderService.getAllOrders();
      return res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: { orders },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async getByTrackingNumber(req: Request, res: Response): Promise<Response> {
    try {
      const trackingNumber: number = req.body.trackingNumber;
      if (!trackingNumber || String(trackingNumber).length < 6) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid tracking number' });
      }
      const existingOrder =
        await orderService.getOrderByTrackingNumber(trackingNumber);
      if (!existingOrder) {
        return res
          .status(404)
          .json({ success: false, message: 'Order not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Order found successfully',
        data: { order: existingOrder },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async getByStatus(req: Request, res: Response): Promise<Response> {
    try {
      const status: OrderStatus = req.body.status;
      if (!ORDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid status' });
      }
      const orders = await orderService.getOrdersByStatus(status);
      return res.status(200).json({
        success: true,
        message: 'Orders fetched successfully',
        data: { orders },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data: CreateOrderDto = req.body;

      if (!data.address || !data.postalCode || !data.phone) {
        return res.status(400).json({
          success: false,
          message: 'All fields required',
        });
      }

      const createdOrder = await orderService.createOrder(data);
      if (!createdOrder) {
        return res.status(403).json({
          success: false,
          message: 'Failed to generate unique tracking number. try again',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: { createdOrder },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const updateData: UpdateOrderDto = req.body;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid update data',
        });
      }
      const updatedOrder = await orderService.updateOrder(id, updateData);
      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Order updated successfully',
        data: { updatedOrder },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const { newStatus } = req.body as { newStatus: OrderStatus };

      if (!ORDER_STATUSES.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status',
        });
      }

      const order = await orderService.getOrderById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const allowedNextStatuses =
        ORDER_STATUS_FLOW[order.status as OrderStatus];

      if (!allowedNextStatuses.includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot change order status from ${order.status} to ${newStatus}`,
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(id, newStatus);

      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: { updatedOrder },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const deletedOrder = await orderService.deleteOrder(id);
      if (!deletedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Order deleted successfully',
        data: { deletedOrder },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new OrderController();
