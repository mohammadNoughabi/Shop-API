import cartService from './cart.service.ts';
import productService from '../product/product.service.ts';
import type { Request, Response } from 'express';
import type { AddCartItemInput, RemoveCartItemInput } from './cart.schema.ts';

class CartController {
  async initialize(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;

    const initializeCartResult = await cartService.initializeCart(userId);

    if (!initializeCartResult.success) {
      return res
        .status(initializeCartResult.statusCode || 500)
        .json(initializeCartResult);
    }

    return res
      .status(initializeCartResult.statusCode || 200)
      .json(initializeCartResult);
  }

  async addItem(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const { productId, quantity } = req.body as AddCartItemInput;

    const getProductResult = await productService.getProductById(productId);
    if (!getProductResult.success || !getProductResult.data?.product) {
      return res
        .status(getProductResult.statusCode || 500)
        .json(getProductResult);
    }

    const updateCartResult = await cartService.addCartItem({
      userId,
      productId,
      quantity,
    });

    if (!updateCartResult.success) {
      return res
        .status(updateCartResult.statusCode || 500)
        .json(updateCartResult);
    }

    return res
      .status(updateCartResult.statusCode || 200)
      .json(updateCartResult);
  }

  async removeItem(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const { productId, quantity } = req.body as RemoveCartItemInput;

    const updateCartResult = await cartService.removeCartItem({
      userId,
      productId,
      quantity,
    });

    if (!updateCartResult.success || !updateCartResult.data?.updatedCart) {
      return res
        .status(updateCartResult.statusCode || 500)
        .json(updateCartResult);
    }

    return res
      .status(updateCartResult.statusCode || 200)
      .json(updateCartResult);
  }
}

export default new CartController();
