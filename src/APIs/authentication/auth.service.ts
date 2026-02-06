// import model
import User from '../user/user.model.ts';

// import types
import type { IUser } from '../user/user.interface.ts';
import type {
  LoginDto,
  RegisterDto,
  forgotPasswordDto,
  resetPasswordDto,
} from './auth.interface.ts';

// import uitls
import sendEmail from '../../utils/mail.ts';
import generateRandomCode from '../../utils/generateRandomCode.ts';

class AuthService {
  async register(data: RegisterDto): Promise<IUser> {
    const { username, email, password } = data;
    const existingUser = await User.findOne({
      email,
      isDeleted: false,
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    const createdUser = new User({
      username,
      email,
      password,
    });
    await createdUser.save();
    return createdUser;
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    const user = await User.findOne({ email, isDeleted: false });

    if (!user) {
      throw new Error('User not found');
    }

    // Compare the hashed passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  async findUserByEmail(email: string) {
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return null;
    }
    return user;
  }

  forgotPassword(data: forgotPasswordDto) {
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

  async resetPassword(data: resetPasswordDto): Promise<IUser | null> {
    const { userId, newPassword } = data;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
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
