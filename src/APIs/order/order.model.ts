import mongoose from 'mongoose';
import type { IOrder } from './order.interface.ts';
import { ORDER_STATUSES } from './order.constants.ts';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema<IOrder>(
  {
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model<IOrder>('Order', orderSchema);
