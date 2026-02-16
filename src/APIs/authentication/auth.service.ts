// import model
import User from '../user/user.model.ts';

// import types
import type { SendEmailResponse } from 'nodemailer';
import type { IUser } from '../user/user.interface.ts';
import type {
  LoginData,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
} from './auth.interface.ts';

// import uitls
import sendEmail from '../../utils/mail.ts';
import generateRandomCode from '../../utils/generateRandomCode.ts';

class AuthService {
  async register(data: RegisterData): Promise<IUser | null> {
    const { username, email, password } = data;
    const existingUser = await User.findOne({
      email,
      isDeleted: false,
    });

    if (existingUser) {
      return null;
    }
    const createdUser = new User({
      username,
      email,
      password,
    });
    await createdUser.save();
    return createdUser;
  }

  async login(data: LoginData): Promise<IUser | null> {
    const { email, username, password } = data;
    const user = await User.findOne({
      $or: [{ email }, { username }],
      isDeleted: false,
    });

    if (!user) {
      return null;
    }

    // Compare the hashed passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return null;
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return null;
    }
    return user;
  }

  forgotPassword(data: ForgotPasswordData): Promise<SendEmailResponse> {
    const code = generateRandomCode();
    const result = sendEmail(
      data.email,
      'Welcome to our Shop',
      ` <div>
            <h2>Verification Email</h2>
            <p>your verification code is ${code}</p>
        </div>`,
    );
    return result;
  }

  async resetPassword(data: ResetPasswordData): Promise<IUser | null> {
    const { userId, newPassword } = data;
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true },
    );
    return updatedUser;
  }
}

export default new AuthService();
