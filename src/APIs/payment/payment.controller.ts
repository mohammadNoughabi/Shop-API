import type { Request, Response } from 'express';

import paymentService from './payment.service.ts';
import userService from '../user/user.service.ts';
import orderService from '../order/order.service.ts';
import productService from '../product/product.service.ts';

class PaymentController {
  async getAll(req: Request, res: Response): Promise<Response> {
    const result = await paymentService.getAllPayments();
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;
    const result = await paymentService.getPaymentById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const orderId = req.query.orderId as string;
    const description = req.body.description as string;
    const email = req.body.email as string;
    const phone = req.body.phone as string;

    const findUserResult = await userService.findUserById(userId);
    if (!findUserResult.success || !findUserResult.data?.user) {
      return res.status(findUserResult.statusCode || 500).json(findUserResult);
    }
    const user = findUserResult.data.user;

    const findOrderResult = await orderService.getOrderById(orderId, userId);
    if (!findOrderResult.success || !findOrderResult.data?.order) {
      return res
        .status(findOrderResult.statusCode || 500)
        .json(findOrderResult);
    }
    const order = findOrderResult.data.order;

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

    const result = await paymentService.createPayment({
      userId: user._id,
      orderId: order._id,
      metadata,
    });

    return res.status(result.statusCode || 200).json(result);
  }

  async initializePayment(
    req: Request,
    res: Response,
  ): Promise<Response | null> {
    const paymentId = req.params.id as string; // zod validated
    const callbackUrl = `${process.env.BASE_URL}/payment/${paymentId}/verify`;

    const result = await paymentService.initializePayment({
      paymentId,
      callbackUrl,
    });

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    const redirectUrl = result.data?.redirectUrl as string;

    res.redirect(redirectUrl);
    return null;
  }

  async verifyPayment(req: Request, res: Response): Promise<Response> {
    const paymentId = req.params.id as string;
    const { authority, status } = req.query;

    // If payment was not successful, cancel it and return error response
    if (status !== 'OK') {
      const result = await paymentService.cancelPayment(paymentId);
      return res.status(result.statusCode || 400).json(result);
    }

    // retrieve payment to get orderId and userId for further processing
    const retrievePaymentResult =
      await paymentService.getPaymentById(paymentId);
    if (
      !retrievePaymentResult.success ||
      !retrievePaymentResult.data?.payment
    ) {
      return res
        .status(retrievePaymentResult.statusCode || 404)
        .json(retrievePaymentResult);
    }
    const payment = retrievePaymentResult.data.payment;
    if (payment.authority !== authority || authority === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Authority mismatch',
      });
    }

    // retrieve order to ensure it exists and belongs to the user
    const retrieveOrderResult = await orderService.getOrderById(
      payment.orderId!.toString(),
      payment.userId!.toString(),
    );
    if (!retrieveOrderResult.success || !retrieveOrderResult.data?.order) {
      return res
        .status(retrieveOrderResult.statusCode || 500)
        .json(retrieveOrderResult);
    }
    const order = retrieveOrderResult.data.order;

    // update order status to paid before verifying payment to prevent race conditions where user might try to verify payment multiple times
    const updateOrderStatusResult = await orderService.updateStatus(
      order._id.toString(),
      'paid',
    );

    if (
      !updateOrderStatusResult.success ||
      !updateOrderStatusResult.data?.order
    ) {
      return res
        .status(updateOrderStatusResult.statusCode || 500)
        .json(updateOrderStatusResult);
    }

    // update product stock before verifying payment to prevent overselling
    const soldItems = order.items.map((item) => ({
      productId: item.productId.toString(),
      quantity: item.quantity,
    }));
    const updateStockResult = await productService.bulkUpdateStock(soldItems);
    if (!updateStockResult.success) {
      return res
        .status(updateStockResult.statusCode || 500)
        .json(updateStockResult);
    }

    // verifying payment with the gateway
    const verifyPaymentResult = await paymentService.verifyPayment({
      authority: authority.toString(),
      amount: String(payment.amount),
    });

    if (!verifyPaymentResult.success || !verifyPaymentResult.data?.payment) {
      return res
        .status(verifyPaymentResult.statusCode || 500)
        .json(verifyPaymentResult);
    }

    return res
      .status(verifyPaymentResult.statusCode || 200)
      .json(verifyPaymentResult);
  }

  async cancelPayment(req: Request, res: Response): Promise<Response> {
    const paymentId = req.params.paymentId as string; // zod validated
    const cancelPaymentResult = await paymentService.cancelPayment(paymentId);
    if (!cancelPaymentResult.success || !cancelPaymentResult.data?.payment) {
      return res
        .status(cancelPaymentResult.statusCode || 404)
        .json(cancelPaymentResult);
    }

    return res
      .status(cancelPaymentResult.statusCode || 200)
      .json(cancelPaymentResult);
  }

  async checkPaymentStatus(req: Request, res: Response): Promise<Response> {
    const paymentId = req.params.paymentId as string; // zod validated
    const checkPaymentStatusResult =
      await paymentService.checkPaymentStatus(paymentId);
    if (!checkPaymentStatusResult.success || !checkPaymentStatusResult.data) {
      return res
        .status(checkPaymentStatusResult.statusCode || 500)
        .json(checkPaymentStatusResult);
    }

    return res
      .status(checkPaymentStatusResult.statusCode || 200)
      .json(checkPaymentStatusResult);
  }
}

export default new PaymentController();
