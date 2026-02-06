import Order from './order.model.ts';

// import utils
import { generateTrackingNumber } from '../../utils/generateTrackingNumber.ts';
import { getErrorMessage } from '../../utils/getErrorMessage.ts';

// import types
import type { IOrder, CreateOrderDto, UpdateOrderDto } from './order.interface';

class OrderService {
  async getAllOrders(): Promise<IOrder[]> {
    const orders: IOrder[] = await Order.find({ isDeleted: false });
    return orders;
  }

  async getOrderById(id: string): Promise<IOrder | null> {
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
      return null;
    }
    return order;
  }

  async getOrderByTrackingNumber(
    trackingNumber: number,
  ): Promise<IOrder | null> {
    const order: IOrder | null = await Order.findOne({
      trackingNumber,
      isDeleted: false,
    });
    if (!order) {
      return null;
    }
    return order;
  }

  async getOrdersByStatus(status: string): Promise<IOrder[]> {
    const orders: IOrder[] = await Order.find({ status, isDeleted: false });
    return orders;
  }

  async createOrder(data: CreateOrderDto): Promise<IOrder | null> {
    const MAX_RETRIES = 5;

    /* eslint-disable no-await-in-loop */
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const order = await Order.create({
          ...data,
          trackingNumber: generateTrackingNumber(10),
        });

        return order;
      } catch (err: unknown) {
        console.log(getErrorMessage(err));
      }
    }
    return null;
  }

  async updateOrder(id: string, updateData: UpdateOrderDto) {
    const existingOrder: IOrder | null = await Order.findById(id);
    if (!existingOrder) {
      return null;
    }
    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );
    return updatedOrder;
  }

  async updateOrderStatus(id: string, newStatus: string) {
    const existingOrder: IOrder | null = await Order.findOne({
      _id: id,
      isDeleted: false,
    });
    if (!existingOrder) {
      return null;
    }
    const updatedOrder: IOrder | null = await Order.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true },
    );
    return updatedOrder;
  }

  async deleteOrder(id: string) {
    const existingOrder = await Order.findOne({ _id: id, isDeleted: false });
    if (!existingOrder) {
      return null;
    }
    const deletedOrder: IOrder | null = await Order.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedOrder;
  }
}

export default new OrderService();
