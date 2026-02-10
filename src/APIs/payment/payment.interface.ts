import type { Document, Types } from 'mongoose';
import type { PaymentStatus } from './payment.constants.ts';
import type {
  CreatePaymentInput,
  InitializePaymentInput,
  VerifyPaymentInput,
} from './payment.schema.ts';

interface MetaData {
  email?: string;
  phone?: string;
  orderId?: string;
}

// Payment Entity Interface
export interface IPayment extends Document {
  amount: number;
  description: string;
  status: PaymentStatus;
  authority?: string;
  refId?: string;
  userId?: Types.ObjectId;
  orderId?: Types.ObjectId;
  metadata?: MetaData;
  cardHash?: string;
  cardPan?: string;
  initializedAt?: Date;
  verifiedAt?: Date;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreatePaymentData = CreatePaymentInput & {
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
};

export type InitializePaymentData = InitializePaymentInput;

export type VerifyPaymentData = VerifyPaymentInput;
