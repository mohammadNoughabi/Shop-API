import type { IUser } from '../user/user.interface.ts';
import type { Result } from '../../types/serviceResult/index';

export type RegisterResult = Result<{ user: IUser }>;
export type LoginResult = Result<{ user: IUser }>;
export type ForgotPasswordResult = Result<{
  code: string;
  email: string;
  sendEmailResult: unknown;
}>;
export type ResetPasswordResult = Result<{ updatedUser: IUser }>;
