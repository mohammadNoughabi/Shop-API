import type { Document, Types } from 'mongoose';
import type { OrderStatus } from './order.constants.ts';

export interface IOrderItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  items: IOrderItem[];
  total: number;
  address: string;
  postalCode: string;
  phone: string;
  trackingNumber: string; // better as string
  status: OrderStatus;
  user: Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Input Types (Client → Server) ====================

export interface CreateOrderInput {
  address: string;
  postalCode: string;
  phone: string;
  // We do NOT accept items or total from client → taken from cart
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface OrderIdParam {
  id: string;
}
