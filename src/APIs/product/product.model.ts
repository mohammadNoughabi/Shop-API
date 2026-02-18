import mongoose from 'mongoose';

import type { IProduct } from './product.interface.ts';

const productSchema = new mongoose.Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      unique: [true, 'Product with this name already exists'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String,
      required: [true, 'Main image is required'],
    },
    gallery: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    rate: {
      type: Number,
      default: 2.5,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
