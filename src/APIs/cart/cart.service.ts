import mongoose from 'mongoose';
import Cart from './cart.model.ts';
import productService from '../product/product.service.ts';
import type {
  ICart,
  ICartItem,
  AddCartItemData,
  RemoveCartItemData,
} from './cart.interface';

class CartService {
  async getCart(userId: string): Promise<ICart | null> {
    const cart = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    return cart;
  }

  async initializeCart(userId: string): Promise<ICart | null> {
    const existing = await Cart.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (existing) {
      return existing; // already exists → return it (idempotent)
    }

    const cart = await Cart.create({
      userId: new mongoose.Types.ObjectId(userId),
      items: [],
      totalAmount: 0,
    });

    return cart;
  }

  async addCartItem(
    data: AddCartItemData & { userId: string },
  ): Promise<ICart | null> {
    const { userId, productId, quantity } = data;

    const product = await productService.getProductById(productId);
    if (!product) {
      return null;
    }

    const price = Number(product.price); // assuming product has .price field

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    // Atomic update: increment if exists, push if not
    const updated = await Cart.findOneAndUpdate(
      {
        userId: userObjectId,
        'items.productId': productObjectId,
      },
      {
        $inc: { 'items.$.quantity': quantity },
      },
      { new: true },
    );

    if (updated) {
      // Item existed → just incremented → recalculate total
      return this.recalculateTotal(updated);
    }

    // Item did not exist → push new one
    const newItem: ICartItem = {
      productId: productObjectId,
      price,
      quantity,
    };

    const cartWithNewItem = await Cart.findOneAndUpdate(
      { userId: userObjectId },
      {
        $push: { items: newItem },
      },
      { new: true },
    );

    if (!cartWithNewItem) {
      return null;
    }

    return this.recalculateTotal(cartWithNewItem);
  }

  async removeCartItem(
    data: RemoveCartItemData & { userId: string },
  ): Promise<ICart | null> {
    const { userId, productId, quantity = Infinity } = data; // Infinity = remove completely

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    let cart = await Cart.findOne({ userId: userObjectId });
    if (!cart) {
      return null;
    }

    const itemIndex = cart.items.findIndex((i) =>
      i.productId.equals(productObjectId),
    );
    if (itemIndex === -1) {
      return cart; // nothing to remove → return as-is
    }

    const currentQty = cart.items[itemIndex].quantity;

    if (quantity >= currentQty || quantity === Infinity) {
      // Remove completely
      cart.items.splice(itemIndex, 1);
    } else {
      // Decrease
      cart.items[itemIndex].quantity -= quantity;
    }

    cart = await cart.save();

    return this.recalculateTotal(cart);
  }

  private async recalculateTotal(cart: ICart): Promise<ICart> {
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    cart.totalAmount = total;
    await cart.save();

    return cart;
  }
}

export default new CartService();
