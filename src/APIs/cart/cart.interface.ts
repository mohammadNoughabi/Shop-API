import type { Document, Schema } from 'mongoose';

export interface ICartItem {
  product: Schema.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  items: ICartItem[];
  total: number;
  user: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
