export type LoginData = {
  username: string;
  email: string;
  password: string;
};

export type RegisterData = {
  username: string;
  email: string;
  password: string;
  profilePic?: string;
};

export type forgotPasswordData = {
  email: string;
}

export type resetPasswordData = {
  verificationCode:string;
  newPassword: string;
}