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
  status: OrderStatus;
  user: Schema.Types.ObjectId;
  isDeleted: boolean;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderCreationData = Pick<
  IOrder,
  | "items"
  | "total"
  | "address"
  | "postalCode"
  | "phone"
  | "trackingNumber"
  | "user"
>;

export type OrderUpdateData = Partial<
  Pick<
    IOrder,
    | "items"
    | "total"
    | "address"
    | "postalCode"
    | "phone"
    | "trackingNumber"
  >
>;
