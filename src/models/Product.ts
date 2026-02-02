import mongoose from "mongoose";

import type { IProduct } from "../interfaces/IProduct.ts";

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Main image is required"],
    },
    gallery: {
      type: [String],
      default: [],
    },
    price: {
      type: String,
      required: [true, "Price is required"],
    },
    rate: {
      type: Number,
      default: 2.5,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
