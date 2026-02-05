import type { IPayment, PaymentCreationData } from './payment.interface.ts';

import Payment from './payment.model.ts';

import { zarinpalService } from './zarinpal.service.ts';

class PaymentService {
  async getAllPayments(): Promise<IPayment[]> {
    const payments = await Payment.find();
    return payments;
  }

  async getPaymentById(id: string): Promise<IPayment | null> {
    const existingPayment = await Payment.findById(id);
    if (!existingPayment) {
      return null;
    }
    return existingPayment;
  }

  async createPayment(
    creationData: PaymentCreationData,
  ): Promise<IPayment | null> {
    const { amount, description, userId, orderId, metadata } = creationData;
    const payment = await Payment.create({
      amount,
      description,
      userId,
      orderId,
      metadata,
    });
    return payment;
  }

  async initializePayment(
    paymentId: string,
    callbackUrl: string,
  ): Promise<{
    redirectUrl: string;
  } | null> {
    const payment = await Payment.findById(paymentId);
    if (!payment) return null;

    if (payment.status !== 'pending') {
      throw new Error('Payment already initialized');
    }

    const result = await zarinpalService.requestPayment({
      amount: payment.amount,
      description: payment.description,
      callbackUrl,
      metadata: {
        email: payment.metadata?.email,
        mobile: payment.metadata?.phone,
        orderId: payment.metadata?.orderId,
      },
    });

    if (!result) {
      payment.status = 'failed';
      await payment.save();
      return null;
    }

    payment.authority = result.authority;
    payment.initializedAt = new Date();
    payment.status = 'initialized';

    await payment.save();

    return { redirectUrl: result.redirectUrl };
  }

  async verifyPayment(
    authority: string,
    amount: number,
  ): Promise<IPayment | null> {
    const payment = await Payment.findOne({ authority });
    if (!payment) return null;

    if (payment.status === 'verified') {
      return payment; // idempotency
    }

    const result = await zarinpalService.verifyPayment(authority, amount);
    if (!result) {
      payment.status = 'failed';
      await payment.save();
      return null;
    }

    payment.refId = result.refId.toString();
    payment.cardPan = result.cardPan;
    payment.cardHash = result.cardHash;
    payment.verifiedAt = new Date();
    payment.status = 'verified';

    await payment.save();

    return payment;
  }

  async cancelPayment(paymentId: string): Promise<IPayment | null> {
    const payment = await Payment.findById(paymentId);
    if (!payment) return null;

    if (payment.status === 'verified') {
      throw new Error('Cannot cancel a paid payment');
    }

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();

    await payment.save();
    return payment;
  }

  async checkPaymentStatus(
    paymentId: string,
  ): Promise<IPayment['status'] | null> {
    const payment = await Payment.findById(paymentId).select('status');
    return payment?.status ?? null;
  }
}

export default new PaymentService();
