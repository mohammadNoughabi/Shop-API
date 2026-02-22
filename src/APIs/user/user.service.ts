import User from './user.model.ts';
import { v4 as uuidv4 } from 'uuid';

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
    const user = await User.findOne({ id, isDeleted: false }).catch(() => null);
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
    const user = await User.findOne({ email, isDeleted: false }).catch(
      () => null,
    );
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
    const user = await User.findOne({ username, isDeleted: false }).catch(
      () => null,
    );
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
    const existingUser = await User.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
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
    const id = uuidv4();
    const existingUser = await User.findOne({ email, isDeleted: false }).catch(
      () => null,
    );
    if (existingUser) {
      return {
        success: false,
        message: 'Email already exists',
        statusCode: 400,
      };
    }
    const newUser = await User.create({ id, username, email, password }).catch(
      () => null,
    );
    if (!newUser) {
      return {
        success: false,
        message: 'Failed to create user',
        statusCode: 500,
      };
    }
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
    const existingUser = await User.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    existingUser.password = newPassword;
    const updatedUser = await existingUser.save().catch(() => null);
    if (!updatedUser) {
      return {
        success: false,
        message: 'Failed to update password',
        statusCode: 500,
      };
    }
    return {
      success: true,
      message: 'Password updated successfully',
      statusCode: 200,
      data: { updatedUser },
    };
  }

  async deleteUserAccount(id: string): Promise<DeleteAccountResult> {
    const existingUser = await User.findOne({
      id,
      isDeleted: false,
    }).catch(() => null);
    if (!existingUser) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    const deletedUser = await User.findOneAndUpdate(
      { id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    ).catch(() => null);
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
