import mongoose from 'mongoose';

import type { Schema } from 'mongoose';

import type { ICategory } from './category.interface.ts';

const categorySchema: Schema = new mongoose.Schema<ICategory>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required to create new Category'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
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

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;
