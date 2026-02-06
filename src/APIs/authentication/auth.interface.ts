export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface forgotPasswordDto {
  email: string;
}

export interface resetPasswordDto {
  userId: string;
  newPassword: string;
}
