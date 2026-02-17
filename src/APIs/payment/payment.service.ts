import type {
  CreatePaymentData,
  InitializePaymentData,
  VerifyPaymentData,
  GetAllPaymentsResult,
  GetPaymentByIdResult,
  CreatePaymentResult,
  InitializePaymentResult,
  VerifyPaymentResult,
  CancelPaymentResult,
  CheckPaymentStatusResult,
} from './payment.interface.ts';

import Payment from './payment.model.ts';

import orderService from '../order/order.service.ts';
import zarinpalService from './zarinpal.service.ts';

class PaymentService {
  async getAllPayments(): Promise<GetAllPaymentsResult> {
    const payments = await Payment.find().catch(() => null);
    if (payments === null) {
      return {
        success: false,
        message: 'Failed to retrieve payments',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Payments retrieved successfully',
      statusCode: 200,
      data: { payments },
    };
  }

  async getPaymentById(id: string): Promise<GetPaymentByIdResult> {
    const existingPayment = await Payment.findById(id).catch(() => null);
    if (!existingPayment) {
      return {
        success: false,
        message: 'Payment not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Payment retrieved successfully',
      statusCode: 200,
      data: { payment: existingPayment },
    };
  }

  async createPayment(data: CreatePaymentData): Promise<CreatePaymentResult> {
    const { userId, orderId, metadata } = data;
    const result = await orderService.getOrderById(
      orderId.toString(),
      userId.toString(),
    );
    if (!result.success || !result.data?.order) {
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404,
      };
    }
    const order = result.data.order;
    const amount = order.total;
    const payment = await Payment.create({
      amount,
      description: metadata.description || `Payment for order ${orderId}`,
      userId,
      orderId,
      metadata,
    }).catch(() => null);

    if (!payment) {
      return {
        success: false,
        message: 'Failed to create payment',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Payment created successfully',
      statusCode: 201,
      data: { payment },
    };
  }

  async initializePayment(
    data: InitializePaymentData,
  ): Promise<InitializePaymentResult> {
    const payment = await Payment.findById(data.paymentId).catch(() => null);
    if (!payment)
      return {
        success: false,
        message: 'Payment not found',
        statusCode: 404,
      };

    if (payment.status === 'initialized') {
      return {
        success: true,
        message: 'Payment already initialized',
        statusCode: 200,
        data: {
          redirectUrl: `https://www.zarinpal.com/pg/StartPay/${payment.authority}`,
        },
      };
    }

    const result = await zarinpalService.requestPayment({
      amount: payment.amount,
      description: payment.description,
      callbackUrl: data.callbackUrl,
      metadata: {
        email: payment.metadata?.email,
        phone: payment.metadata?.phone,
        orderId: payment.metadata?.orderId,
      },
    });

    if (!result) {
      payment.status = 'failed';
      await payment.save().catch(() => null);
      await orderService.cancelOrder(
        payment.orderId!.toString(),
        payment.userId!.toString(),
      ); // Cancel the order if payment initialization fails
      return {
        success: false,
        message: 'Payment initialization failed',
        statusCode: 500,
      };
    }

    payment.authority = result.authority;
    payment.initializedAt = new Date();
    payment.status = 'initialized';

    const dbSuccess = await payment.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to initialize payment',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Payment initialized successfully',
      statusCode: 200,
      data: {
        redirectUrl: `https://www.zarinpal.com/pg/StartPay/${payment.authority}`,
      },
    };
  }

  async verifyPayment(data: VerifyPaymentData): Promise<VerifyPaymentResult> {
    const { authority, amount } = data;
    const payment = await Payment.findOne({ authority }).catch(() => null);
    if (!payment)
      return {
        success: false,
        message: 'Payment not found',
        statusCode: 404,
      };

    if (payment.status === 'verified') {
      return {
        success: true,
        message: 'Payment already verified',
        statusCode: 200,
        data: { payment },
      };
    }

    const result = await zarinpalService.verifyPayment(
      authority,
      Number(amount),
    );
    if (!result) {
      payment.status = 'failed';
      await payment.save().catch(() => null);
      await orderService.cancelOrder(
        payment.orderId!.toString(),
        payment.userId!.toString(),
      ); // Cancel the order if payment verification fails
      return {
        success: false,
        message: 'Payment verification failed',
        statusCode: 500,
      };
    }

    payment.refId = result.refId.toString();
    payment.cardPan = result.cardPan;
    payment.cardHash = result.cardHash;
    payment.verifiedAt = new Date();
    payment.status = 'verified';

    const dbSuccess = await payment.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to verify payment',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Payment verified successfully',
      statusCode: 200,
      data: { payment },
    };
  }

  async cancelPayment(paymentId: string): Promise<CancelPaymentResult> {
    const payment = await Payment.findById(paymentId).catch(() => null);
    if (!payment)
      return {
        success: false,
        message: 'Payment not found',
        statusCode: 404,
      };

    if (payment.status === 'verified') {
      throw new Error('Cannot cancel a paid payment');
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();

    const dbSuccess = await payment.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to cancel payment',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Payment cancelled successfully',
      statusCode: 200,
      data: { payment },
    };
  }

  async checkPaymentStatus(
    paymentId: string,
  ): Promise<CheckPaymentStatusResult> {
    const payment = await Payment.findById(paymentId).select('status');
    if (!payment) {
      return {
        success: false,
        message: 'Payment not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Payment status retrieved successfully',
      statusCode: 200,
      data: { paymentStatus: payment.status },
    };
  }
}

export default new PaymentService();
