import User from './user.model.ts';

import type {
  FindByIdResult,
  FindByEmailResult,
  FindByUsernameResult,
  GetProfileResult,
  CreateUserResult,
  UpdatePasswordResult,
  DeleteAccountResult,
} from './user.interface.ts';
import type { CreateUserInput, UpdatePasswordInput } from './user.schema.ts';

class UserService {
  async findUserById(id: string): Promise<FindByIdResult> {
    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'User found',
      statusCode: 200,
      data: { user },
    };
  }

  async findUserByEmail(email: string): Promise<FindByEmailResult> {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'User found',
      statusCode: 200,
      data: { user },
    };
  }

  async findUserByUsername(username: string): Promise<FindByUsernameResult> {
    const user = await User.findOne({ username, isDeleted: false });
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'User found',
      statusCode: 200,
      data: { user },
    };
  }

  async getUserProfile(id: string): Promise<GetProfileResult> {
    const existingUser = await User.findOne({ _id: id, isDeleted: false });
    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'User found',
      statusCode: 200,
      data: { user: existingUser },
    };
  }

  async createUser(data: CreateUserInput): Promise<CreateUserResult> {
    const { username, email, password } = data;
    const existingUser = await User.findOne({ email, isDeleted: false });
    if (existingUser) {
      return {
        success: false,
        message: 'Email already exists',
        statusCode: 400,
      };
    }
    const newUser = await User.create({ username, email, password });
    return {
      success: true,
      message: 'User created successfully',
      statusCode: 201,
      data: { user: newUser },
    };
  }

  async updateUserPassword(
    data: UpdatePasswordInput,
  ): Promise<UpdatePasswordResult> {
    const { id, newPassword } = data;
    const existingUser = await User.findOne({ _id: id, isDeleted: false });
    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    existingUser.password = newPassword;
    const updatedUser = await existingUser.save();
    return {
      success: true,
      message: 'Password updated successfully',
      statusCode: 200,
      data: { updatedUser },
    };
  }

  async deleteUserAccount(id: string): Promise<DeleteAccountResult> {
    const existingUser = await User.findOne({ _id: id, isDeleted: false });
    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    if (!deletedUser) {
      return {
        success: false,
        message: 'Failed to delete user account',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'User deleted successfully',
      statusCode: 200,
      data: { deletedUser },
    };
  }
}

export default new UserService();
