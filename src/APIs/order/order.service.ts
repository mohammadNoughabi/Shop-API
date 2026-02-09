import mongoose from 'mongoose';
import Order from './order.model.ts';
import Cart from '../cart/cart.model.ts'; // ← important
import { generateTrackingNumber } from '../../utils/generateTrackingNumber.ts';
import { ORDER_STATUS_FLOW } from './order.constants.ts';
import type { OrderStatus } from './order.constants.ts';
import type { IOrder, CreateOrderInput } from './order.interface.ts';

class OrderService {
  async createOrderFromCart(
    userId: string,
    data: CreateOrderInput,
  ): Promise<IOrder | null> {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Get user's cart
    const cart = await Cart.findOne({ userId: userObjectId });
    if (!cart || cart.items.length === 0) {
      return null;
    }

    // 2. Generate unique tracking number
    let trackingNumber = String(generateTrackingNumber(12));
    const existingOrder = await Order.findOne({ trackingNumber });
    while (existingOrder) {
      trackingNumber = String(generateTrackingNumber(12));
    }

    // 3. Create order from cart snapshot
    const orderItems = cart.items.map((item) => ({
      product: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      user: userObjectId,
      items: orderItems,
      total,
      address: data.address,
      postalCode: data.postalCode,
      phone: data.phone,
      trackingNumber,
      status: 'pending',
    });

    return order;
  }

  async getMyOrders(userId: string): Promise<IOrder[]> {
    const order = await Order.find({
      user: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    })
      .populate('items.product', 'name price image') // adjust fields
      .sort({ createdAt: -1 });
    return order;
  }

  async getOrderById(orderId: string, userId: string): Promise<IOrder | null> {
    const order = await Order.findOne({
      _id: orderId,
      user: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    }).populate('items.product');
    return order;
  }

  private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    return ORDER_STATUS_FLOW[from].includes(to);
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<IOrder | null> {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) return null;

    if (!this.isValidTransition(order.status, newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${newStatus}`,
      );
    }

    order.status = newStatus;
    await order.save();
    return order;
  }

  async softDelete(orderId: string, userId: string): Promise<IOrder | null> {
    const order = await Order.findOne({
      _id: orderId,
      user: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!order) return null;
    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be canceled');
    }

    order.isDeleted = true;
    order.deletedAt = new Date();
    await order.save();
    return order;
  }
}

export default new OrderService();
