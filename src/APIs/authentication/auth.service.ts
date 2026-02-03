import User from "../user/user.model.ts";

import type { IUser } from "../user/user.interface.ts";
class AuthService {
  constructor() {}

  async register(
    username: string,
    email: string,
    password: string,
    profilePic?: string,
  ): Promise<IUser> {
    const existingUser = await User.findOne({ email, isDeleted: false });

    if (existingUser) {
      throw new Error("User already exists with this email");
    }
    const createdUser = new User({
      username,
      email,
      password,
      profilePic,
    });
    await createdUser.save();
    return createdUser;
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      throw new Error("User not found");
    }

    // Compare the hashed passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }
    return user;
  }

  async forgotPassword(email: string) {
    // Implementation for forgot password
  }

  async resetPassword(token: string, newPassword: string) {
    // Implementation for reset password
  } 
}

export default new AuthService();
