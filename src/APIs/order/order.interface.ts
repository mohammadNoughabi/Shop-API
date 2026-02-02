import { Document, Schema } from "mongoose";

// import types
import type { OrderStatus } from "./order.constants.ts";
import type { IPayment } from "../payment/payment.interface.ts";

export type OrderItem = {
  product: Schema.Types.ObjectId;
  quantity: number;
  price: number;
};

export interface IOrder extends Document {
  items: OrderItem[];
  total: number;
  address: string;
  postalCode: string;
  phone: string;
  trackingNumber: number;
  payment: IPayment;
  status: OrderStatus;
  user: Schema.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
