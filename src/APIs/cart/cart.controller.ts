import cartService from './cart.service.ts';
import productService from '../product/product.service.ts';
import type { Request, Response } from 'express';
import type { AddCartItemInput, RemoveCartItemInput } from './cart.schema.ts';

class CartController {
  async initialize(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id as string;

      const cart = await cartService.initializeCart(userId);

      if (!cart) {
        res.status(400).json({
          success: false,
          message: 'Cannot initialize cart – user not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Cart initialized successfully',
        data: { cart },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async addItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id as string;
      const { productId, quantity } = req.body as AddCartItemInput;

      const product = await productService.getProductById(productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: 'Product not found',
        });
        return;
      }

      const updatedCart = await cartService.addCartItem({
        userId,
        productId,
        quantity,
      });

      if (!updatedCart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found or product invalid',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Item added to cart',
        data: { updatedCart },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async removeItem(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id as string;
      const { productId, quantity } = req.body as RemoveCartItemInput;

      const updatedCart = await cartService.removeCartItem({
        userId,
        productId,
        quantity,
      });

      if (!updatedCart) {
        res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Item removed / quantity decreased',
        data: { updatedCart },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new CartController();
