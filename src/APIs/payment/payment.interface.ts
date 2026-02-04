import type { Document, Schema } from 'mongoose';

import type { PaymentStatus } from './payment.constants.ts';

export interface IPayment extends Document {
  orderId: Schema.Types.ObjectId;
  transactionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
