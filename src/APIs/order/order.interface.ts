import type { Document, Schema } from 'mongoose';

// import types
import type { OrderStatus } from './order.constants.ts';

export interface OrderItem {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  items: OrderItem[];
  total: number;
  address: string;
  postalCode: string;
  phone: string;
  trackingNumber: number;
  status: OrderStatus;
  user: Schema.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateOrderDto = Pick<
  IOrder,
  'items' | 'total' | 'address' | 'postalCode' | 'phone' | 'user'
>;

export type UpdateOrderDto = Partial<
  Pick<
    IOrder,
    'items' | 'total' | 'address' | 'postalCode' | 'phone' | 'trackingNumber'
  >
>;
