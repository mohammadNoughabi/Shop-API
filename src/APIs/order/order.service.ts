import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Order from './order.model.ts';
import Cart from '../cart/cart.model.ts';
import { generateTrackingNumber } from '../../utils/generateTrackingNumber.ts';
import { ORDER_STATUS_FLOW } from './order.constants.ts';
import type { OrderStatus } from './order.constants.ts';
import type {
  CreateOrderInput,
  CreateOrderResult,
  GetMyOrdersResult,
  GetOrderByIdResult,
  UpdateOrderStatusResult,
  CancelOrderResult,
  SoftDeleteOrderResult,
} from './order.interface.ts';

class OrderService {
  async createOrderFromCart(
    userId: string,
    data: CreateOrderInput,
  ): Promise<CreateOrderResult> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Get user's cart
    const cart = await Cart.findOne({ userId: userObjectId })
      .populate('items.productId')
      .catch(() => null);
    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Cart is empty', statusCode: 400 };
    }

    // 2. Generate unique tracking number
    let trackingNumber = String(generateTrackingNumber(12));
    const existingOrder = await Order.findOne({ trackingNumber }).catch(
      () => null,
    );
    if (!existingOrder) {
      trackingNumber = String(generateTrackingNumber(12));
    }
    while (existingOrder) {
      trackingNumber = String(generateTrackingNumber(12));
    }

    // 3. Create order from cart snapshot
    const orderItems = cart.items.map((item) => ({
      id: uuidv4(),
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      id: uuidv4(),
      userId: userObjectId,
      items: orderItems,
      total,
      address: data.address,
      postalCode: data.postalCode,
      phone: data.phone,
      trackingNumber,
      status: 'pending',
    }).catch(() => null);

    if (!order) {
      return {
        success: false,
        message: 'Failed to create order',
        statusCode: 500,
      };
    }

    // 4. Clear user's cart
    cart.items = [];
    await cart.save();

    return {
      success: true,
      message: 'Order created successfully',
      statusCode: 201,
      data: { order },
    };
  }

  async getMyOrders(userId: string): Promise<GetMyOrdersResult> {
    const orders = await Order.find({
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    })
      .populate('items.productId', 'name price image') // adjust fields
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: 'Orders retrieved successfully',
      statusCode: 200,
      data: { orders },
    };
  }

  async getOrderById(
    orderId: string,
    userId: string,
  ): Promise<GetOrderByIdResult> {
    const order = await Order.findOne({
      id: orderId,
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    }).populate('items.productId', 'name price image'); // adjust fields
    if (!order) {
      return { success: false, message: 'Order not found', statusCode: 404 };
    }
    return {
      success: true,
      message: 'Order retrieved successfully',
      statusCode: 200,
      data: { order },
    };
  }

  private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    return ORDER_STATUS_FLOW[from].includes(to);
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
  ): Promise<UpdateOrderStatusResult> {
    const order = await Order.findOne({ id: orderId, isDeleted: false });
    if (!order)
      return { success: false, message: 'Order not found', statusCode: 404 };

    if (!this.isValidTransition(order.status, newStatus)) {
      throw new Error(
        `Invalid status transition: ${order.status} → ${newStatus}`,
      );
    }

    order.status = newStatus;
    const dbSuccess = await order.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to update order status',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Order status updated successfully',
      statusCode: 200,
      data: { order },
    };
  }

  async cancelOrder(
    orderId: string,
    userId: string,
  ): Promise<CancelOrderResult> {
    const order = await Order.findOne({
      id: orderId,
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!order)
      return {
        success: false,
        message: 'Order not found',
        statusCode: 404,
      };
    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be canceled');
    }

    order.status = 'canceled';
    const dbSuccess = await order.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to cancel order',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Order canceled successfully',
      statusCode: 200,
      data: { cancelledOrder: order },
    };
  }

  async softDelete(
    orderId: string,
    userId: string,
  ): Promise<SoftDeleteOrderResult> {
    const order = await Order.findOne({
      id: orderId,
      userId: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!order)
      return { success: false, message: 'Order not found', statusCode: 404 };
    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be deleted');
    }

    order.isDeleted = true;
    order.deletedAt = new Date();
    const dbSuccess = await order.save().catch(() => null);
    if (!dbSuccess) {
      return {
        success: false,
        message: 'Failed to delete order',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Order deleted successfully',
      statusCode: 200,
      data: { deletedOrder: order },
    };
  }
}

export default new OrderService();
