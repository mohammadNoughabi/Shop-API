import type { Document, Schema } from 'mongoose';
import type { Result } from '../../types/serviceResult/index';

export interface IUser extends Document {
  username: string;
  email?: string;
  password: string;
  role: string;
  profilePic?: string;
  favorites: Schema.Types.ObjectId[];
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type FindByIdResult = Result<{ user: IUser }>;
export type FindByEmailResult = Result<{ user: IUser }>;
export type FindByUsernameResult = Result<{ user: IUser }>;
export type GetProfileResult = Result<{ user: IUser }>;
export type CreateUserResult = Result<{ user: IUser }>;
export type UpdatePasswordResult = Result<{ updatedUser: IUser }>;
export type DeleteAccountResult = Result<{ deletedUser: IUser }>;
