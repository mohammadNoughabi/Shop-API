import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './auth.schema.ts';

export interface LoginData extends LoginInput {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData extends RegisterInput {
  username: string;
  email?: string;
  password: string;
}

export interface ForgotPasswordData extends ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordData extends ResetPasswordInput {
  userId: string;
  newPassword: string;
}
