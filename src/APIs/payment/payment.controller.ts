import type { Request, Response } from 'express';

import paymentService from './payment.service.ts';
import userService from '../user/user.service.ts';
import orderService from '../order/order.service.ts';
import productService from '../product/product.service.ts';

class PaymentController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const payments = await paymentService.getAllPayments();
      return res.status(200).json({
        success: true,
        message: 'Payments fetched successfully',
        data: { payments },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      const payment = await paymentService.getPaymentById(id);
      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: 'Payment not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Payment fetched successfully',
        data: { payment },
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
      const userId = req.user._id as string;
      const orderId = req.query.orderId as string;
      const description = req.body.description as string;
      const email = req.body.email as string;
      const phone = req.body.phone as string;

      const user = await userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const order = await orderService.getOrderById(orderId, userId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      const amount = order.total;

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than 0',
        });
      }

      const metadata = {
        description,
        email,
        phone,
      };

      const createdPayment = await paymentService.createPayment({
        userId: user._id,
        orderId: order._id,
        metadata,
      });

      return res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: { createdPayment },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async initializePayment(
    req: Request,
    res: Response,
  ): Promise<Response | null> {
    try {
      const paymentId = req.params.id as string;

      if (!paymentId) {
        return res.status(404).json({
          success: false,
          message: 'payment not found',
        });
      }

      const callbackUrl = `${process.env.BASE_URL}/payment/${paymentId}/verify`;

      const result = await paymentService.initializePayment({
        paymentId,
        callbackUrl,
      });

      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Payment initialization failed',
        });
      }

      res.redirect(result.redirectUrl);
      return null;
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.id as string;
      const { authority, status } = req.query;

      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      if (status !== 'OK') {
        await paymentService.cancelPayment(paymentId);
        return res.status(400).json({
          success: false,
          message: 'Payment was cancelled by user',
        });
      }

      if (payment.authority !== authority || authority === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Authority mismatch',
        });
      }

      const verifiedPayment = await paymentService.verifyPayment({
        authority: authority.toString(),
        amount: String(payment.amount),
      });

      if (!verifiedPayment) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed',
        });
      }

      const order = await orderService.getOrderById(
        payment.orderId!.toString(),
        payment.userId!.toString(),
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Associated order not found',
        });
      }

      await orderService.updateStatus(order._id.toString(), 'paid');

      const soldItems = order.items.map((item) => ({
        productId: item.product._id.toString(),
        quantity: item.quantity,
      }));

      await productService.bulkUpdateStock(soldItems);

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { payment: verifiedPayment, order, soldItems },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async cancelPayment(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.paymentId as string;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'paymentId is required',
        });
      }

      const payment = await paymentService.cancelPayment(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment cancelled successfully',
        data: { payment },
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async checkPaymentStatus(req: Request, res: Response): Promise<Response> {
    try {
      const paymentId = req.params.paymentId as string;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'paymentId is required',
        });
      }

      const status = await paymentService.checkPaymentStatus(paymentId);
      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment status fetched successfully',
        data: { status },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

export default new PaymentController();
