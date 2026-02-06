import mongoose from 'mongoose';

import type { ICart } from './cart.interface';

const cartSchema = new mongoose.Schema<ICart>({});

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
