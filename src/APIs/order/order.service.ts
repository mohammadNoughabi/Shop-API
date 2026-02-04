import Order from "./order.model";

// import utils
import { generateTrackingNumber } from "../../utils/generateTrackingNumber";

// import types
import type {
  IOrder,
  OrderCreationData,
  OrderUpdateData,
} from "./order.interface";

class OrderService {
  constructor() {}

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

  async createOrder(data: OrderCreationData) {
    let existingOrder = await Order.findOne({
      trackingNumber: data.trackingNumber,
    });
    while (existingOrder) {
      data.trackingNumber = generateTrackingNumber(10);
      existingOrder = await Order.findOne({
        trackingNumber: data.trackingNumber,
      });
    }
    const newOrder: IOrder = await Order.create(data);
    return newOrder;
  }

  async updateOrder(id: string, updateData: OrderUpdateData) {
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
