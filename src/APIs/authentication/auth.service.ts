// import model
import User from '../user/user.model.ts';

// import types
import type { IUser } from '../user/user.interface.ts';

// import uitls
import sendEmail from '../../utils/mail.ts';
import generateRandomCode from '../../utils/generateRandomCode.ts';

class AuthService {
  async register(
    username: string,
    email: string,
    password: string,
    profilePic?: string,
  ): Promise<IUser> {
    const existingUser = await User.findOne({ email, isDeleted: false });

    if (existingUser) {
      throw new Error('User already exists with this email');
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

  forgotPassword(email: string) {
    const code = generateRandomCode();
    const result = sendEmail(
      email,
      'Welcome to our Shop',
      ` <div>
            <h2>Verification Email</h2>
            <p>your verification code is ${code}</p>
        </div>`,
    );
    return result;
  }

  async resetPassword(
    newPassword: string,
    userId: string,
  ): Promise<IUser | null> {
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
