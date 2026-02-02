import mongoose from "mongoose";

// import types
import type { OrderItem, IOrder } from "../interfaces/IOrder.ts";

// import consts
import { ORDER_STATUSES } from "../constants/order.constants.ts";

const orderItemSchema = new mongoose.Schema<OrderItem>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false, // optional: prevents extra _id for each item
  },
);

const orderSchema = new mongoose.Schema<IOrder>(
  {
    items: {
      type: [orderItemSchema],
      required: [true, "There is no item in your order"],
      default: [],
    },
    total: {
      type: Number,
      min: [0, "Total must be more than 0"],
    },
    address: {
      type: String,
      required: [true, "Address can not be empty"],
      minlength: [10, "Address must be at least 10 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal Code can not be empty"],
      minlength: [10, "Postal Code must be at least 10 digits"],
    },
    phone: {
      type: String,
      required: [true, "Phone can not be empty"],
      minlength: 10,
    },
    trackingNumber: {
      type: Number,
      required: true,
      min: 4,
      max: 10,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
