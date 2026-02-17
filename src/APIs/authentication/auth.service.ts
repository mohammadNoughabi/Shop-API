// import User service
import userService from '../user/user.service.ts';

// import types
import type { LoginInput, RegisterInput } from './auth.schema.ts';
import type {
  LoginResult,
  RegisterResult,
  ForgotPasswordResult,
  ResetPasswordResult,
} from './auth.interface.ts';

// import uitls
import sendEmail from '../../utils/mail.ts';
import generateRandomCode from '../../utils/generateRandomCode.ts';

class AuthService {
  async register(data: RegisterInput): Promise<RegisterResult> {
    const { username, email, password } = data;
    if (email) {
      const duplicateEmailResult = await userService.findUserByEmail(email);
      if (duplicateEmailResult.success) {
        return {
          success: false,
          message: 'Email already exists',
          statusCode: 409,
        };
      }
    }
    const createUserResult = await userService.createUser({
      username,
      email,
      password,
    });
    if (!createUserResult.success) {
      return {
        success: false,
        message: 'Failed to create user',
        statusCode: 500,
      };
    }
    const user = createUserResult.data!.user;
    return {
      success: true,
      message: 'User registered successfully',
      statusCode: 201,
      data: { user },
    };
  }

  async login(data: LoginInput): Promise<LoginResult> {
    const { email, username, password } = data;
    const findUserResult = email
      ? await userService.findUserByEmail(email)
      : await userService.findUserByUsername(username!);
    if (!findUserResult.success) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    const user = findUserResult.data!.user;

    // Compare the hashed passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid password',
        statusCode: 401,
      };
    }
    return {
      success: true,
      message: 'Login successful',
      statusCode: 200,
      data: { user: user.toObject() },
    };
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    if (!email) {
      return {
        success: false,
        message: 'Email is required',
        statusCode: 400,
      };
    }

    const existingUserResult = await userService.findUserByEmail(email);
    if (!existingUserResult.success) {
      return {
        success: false,
        message: 'User not found with this email address',
        statusCode: 404,
      };
    }

    const code = generateRandomCode(6);
    const result = await sendEmail(
      email,
      'Welcome to our Shop',
      ` <div>
            <h2>Verification Email</h2>
            <p>your verification code is ${code}</p>
        </div>`,
    );
    return {
      success: true,
      message: 'Verification code sent to email',
      statusCode: 200,
      data: {
        code,
        email: email,
        sendEmailResult: result,
      },
    };
  }

  async resetPassword(
    id: string,
    newPassword: string,
  ): Promise<ResetPasswordResult> {
    const duplicateIdResult = await userService.findUserById(id);
    if (!duplicateIdResult.success) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    const updatePasswordResult = await userService.updateUserPassword({
      id,
      newPassword,
    });
    if (!updatePasswordResult.success) {
      return {
        success: false,
        message: 'Failed to update password',
        statusCode: 500,
      };
    }
    const updatedUser = updatePasswordResult.data!.updatedUser;
    return {
      success: true,
      message: 'Password reset successfully',
      statusCode: 200,
      data: { updatedUser },
    };
  }
}

export default new AuthService();
