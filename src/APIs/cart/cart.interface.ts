import type { Document, Types } from 'mongoose';
import type { Result } from '../../types/serviceResult/index.d.ts';

export interface ICartItem {
  id: string;
  productId: Types.ObjectId;
  price: number;
  quantity: number;
}

export interface ICart extends Document {
  id: string;
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type GetCartResult = Result<{ cart: ICart | null }>;
export type InitializeCartResult = Result<{ cart: ICart }>;
export type AddCartItemResult = Result<{ updatedCart: ICart }>;
export type RemoveCartItemResult = Result<{ updatedCart: ICart }>;
export type RecalculateTotalResult = Result<{ updatedCart: ICart }>;
