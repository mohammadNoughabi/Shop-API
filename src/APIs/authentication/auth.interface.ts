export interface LoginData {
  username: string;
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  profilePic?: string;
}

export interface forgotPasswordData {
  email: string;
}

export interface resetPasswordData {
  verificationCode: string;
  newPassword: string;
}
