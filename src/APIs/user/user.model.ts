import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import type { IUser } from './user.interface.ts';

const userSchema = new mongoose.Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: [true, 'username is required'],
    },
    email: {
      type: String,
      default: '',
      unique: [
        true,
        'User already exists with this email , please login instead',
      ],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    role: {
      type: String,
      enum: ['regular', 'admin'],
      default: 'regular',
    },
    profilePic: {
      type: String,
      default: '',
    },
    favorites: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      default: [],
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

userSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  const password = this.password as string;
  const result = await bcrypt.compare(candidatePassword, password);
  return result;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
