import mongoose from 'mongoose';

import type { IPayment } from './payment.interface.ts';
import { PAYMENT_STATUSES } from './payment.constants.ts';

const paymentSchema = new mongoose.Schema<IPayment>(
  {
    amount: {
      type: Number,
      required: true,
      min: 1000, // Minimum amount (in Rials)
    },
    description: {
      type: String,
      required: true,
      trim: true,
      default: 'Buy from shop',
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'pending',
    },
    authority: {
      type: String,
      unique: true,
      sparse: true,
    },
    refId: {
      type: String,
      unique: true,
      sparse: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    cardHash: String,
    cardPan: String,
    initializedAt: Date,
    verifiedAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
