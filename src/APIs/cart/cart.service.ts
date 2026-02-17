import { Types } from 'mongoose';
import Cart from './cart.model.ts';
import productService from '../product/product.service.ts';
import type {
  ICart,
  ICartItem,
  GetCartResult,
  InitializeCartResult,
  AddCartItemResult,
  RemoveCartItemResult,
  RecalculateTotalResult,
} from './cart.interface';
import type { AddCartItemInput, RemoveCartItemInput } from './cart.schema.ts';

class CartService {
  async getCart(userId: string): Promise<GetCartResult> {
    const cart = await Cart.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Cart retrieved successfully',
      statusCode: 200,
      data: { cart },
    };
  }

  async initializeCart(userId: string): Promise<InitializeCartResult> {
    const existing = await Cart.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      return {
        success: true,
        message: 'Cart already exists',
        statusCode: 200,
        data: { cart: existing },
      };
    }

    const cart = await Cart.create({
      userId: new Types.ObjectId(userId),
      items: [],
      totalAmount: 0,
    });

    return {
      success: true,
      message: 'Cart initialized successfully',
      statusCode: 200,
      data: { cart },
    };
  }

  async addCartItem(
    data: AddCartItemInput & { userId: string },
  ): Promise<AddCartItemResult> {
    const { userId, productId, quantity } = data;

    const findProductResult = await productService.getProductById(productId);
    if (!findProductResult.success || !findProductResult.data?.product) {
      return {
        success: false,
        message: 'Product not found',
        statusCode: 404,
      };
    }

    const product = findProductResult.data.product;

    const price = Number(product.price);

    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    // Atomic update: increment if exists, push if not
    let updatedCart;
    updatedCart = await Cart.findOneAndUpdate(
      {
        userId: userObjectId,
        'items.productId': productObjectId,
      },
      {
        $inc: { 'items.$.quantity': quantity },
      },
      { new: true, runValidators: true },
    );

    if (updatedCart) {
      const recalc = await this.recalculateTotal(updatedCart);
      if (!recalc.success || !recalc.data?.updatedCart) {
        return {
          success: false,
          message: 'Failed to recalculate total',
          statusCode: 500,
        };
      }
      return {
        success: true,
        message: 'Cart item quantity updated successfully',
        statusCode: 200,
        data: {
          updatedCart: recalc.data.updatedCart,
        },
      };
    }

    // Item did not exist → push new one
    const newItem: ICartItem = {
      productId: productObjectId,
      price,
      quantity,
    };

    updatedCart = await Cart.findOneAndUpdate(
      { userId: userObjectId },
      { $push: { items: newItem } },
      { new: true, runValidators: true },
    );

    if (!updatedCart) {
      return {
        success: false,
        message: 'Cart not found for user',
        statusCode: 404,
      };
    }

    const recalc = await this.recalculateTotal(updatedCart);
    if (!recalc.success || !recalc.data?.updatedCart) {
      return {
        success: false,
        message: 'Failed to recalculate total',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Cart item added successfully',
      statusCode: 200,
      data: { updatedCart: recalc.data.updatedCart },
    };
  }

  async removeCartItem(
    data: RemoveCartItemInput & { userId: string },
  ): Promise<RemoveCartItemResult> {
    const { userId, productId, quantity = Infinity } = data;

    const userObjectId = new Types.ObjectId(userId);
    const productObjectId = new Types.ObjectId(productId);

    const cart = await Cart.findOne({ userId: userObjectId });
    if (!cart) {
      return { success: false, message: 'Cart not found', statusCode: 404 };
    }

    const itemIndex = cart.items.findIndex((i) =>
      i.productId.equals(productObjectId),
    );
    if (itemIndex === -1) {
      return {
        success: false,
        message: 'Cart item not found',
        statusCode: 404,
      };
    }

    const currentQty = cart.items[itemIndex].quantity;

    if (quantity >= currentQty || quantity === Infinity) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity -= quantity;
    }

    const savedCart = await cart.save();

    const recalc = await this.recalculateTotal(savedCart);
    if (!recalc.success || !recalc.data?.updatedCart) {
      return {
        success: false,
        message: 'Failed to recalculate',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Cart item removed successfully',
      statusCode: 200,
      data: { updatedCart: recalc.data.updatedCart },
    };
  }

  private async recalculateTotal(cart: ICart): Promise<RecalculateTotalResult> {
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    cart.totalAmount = total;

    const saved = await cart.save();

    return {
      success: true,
      message: 'Cart total recalculated',
      statusCode: 200,
      data: { updatedCart: saved },
    };
  }
}

export default new CartService();
