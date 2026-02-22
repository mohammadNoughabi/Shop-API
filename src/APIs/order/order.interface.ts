import type { Document, Types } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';
import type { OrderStatus } from './order.constants.ts';

export interface IOrderItem {
  id: string;
  productId: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  id: string;
  items: IOrderItem[];
  total: number;
  address: string;
  postalCode: string;
  phone: string;
  trackingNumber: string; // better as string
  status: OrderStatus;
  userId: Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Input Types (use in service) ====================

export interface CreateOrderInput {
  address: string;
  postalCode: string;
  phone: string;
  // We do NOT accept items or total from client → taken from cart
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export type CreateOrderResult = Result<{ order: IOrder }>;
export type GetMyOrdersResult = Result<{ orders: IOrder[] }>;
export type GetOrderByIdResult = Result<{ order: IOrder }>;
export type UpdateOrderStatusResult = Result<{ order: IOrder }>;
export type CancelOrderResult = Result<{ cancelledOrder: IOrder }>;
export type SoftDeleteOrderResult = Result<{ deletedOrder: IOrder }>;
