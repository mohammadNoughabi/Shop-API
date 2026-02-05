import type { Request, Response } from 'express';

import paymentService from './payment.service.ts';
import userService from '../user/user.service.ts';
import orderService from '../order/order.service.ts';

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
      const { userId, orderId } = req.query;

      if (typeof userId !== 'string' || typeof orderId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'userId and orderId are required',
        });
      }

      const description =
        typeof req.body.description === 'string'
          ? req.body.description
          : 'Buy from shop';

      const user = await userService.findUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const order = await orderService.getOrderById(orderId);
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
        email: typeof req.body.email === 'string' ? req.body.email : undefined,
        phone: typeof req.body.phone === 'string' ? req.body.phone : undefined,
        orderId,
      };

      const createdPayment = await paymentService.createPayment({
        amount,
        description,
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
        return res.status(400).json({
          success: false,
          message: 'paymentId is required',
        });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      const callbackUrl = `${process.env.BASE_URL}/payment/${paymentId}/verify`;

      const result = await paymentService.initializePayment(
        paymentId,
        callbackUrl,
      );

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
      const { Authority, Status } = req.query;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'paymentId is required',
        });
      }

      if (typeof Authority !== 'string' || typeof Status !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid callback parameters',
        });
      }

      const payment = await paymentService.getPaymentById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      if (Status !== 'OK') {
        await paymentService.cancelPayment(paymentId);
        return res.status(400).json({
          success: false,
          message: 'Payment was cancelled by user',
        });
      }

      if (payment.authority !== Authority) {
        return res.status(400).json({
          success: false,
          message: 'Authority mismatch',
        });
      }

      const verifiedPayment = await paymentService.verifyPayment(
        Authority,
        payment.amount,
      );

      if (!verifiedPayment) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: { payment: verifiedPayment },
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
