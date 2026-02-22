import mongoose from 'mongoose';

import type { ICart, ICartItem } from './cart.interface';

const cartItemSchema = new mongoose.Schema<ICartItem>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  price: {
    type: Number,
  },
  quantity: {
    type: Number,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema<ICart>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
