import type { Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  price: number;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Client → server after zod validation
export interface AddCartItemData {
  productId: string;
  quantity: number;
}

export interface RemoveCartItemData {
  productId: string;
  quantity?: number; // optional – if missing or 0 → remove completely
}
