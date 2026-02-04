import User from './user.model';

import type { IUser } from './user.interface';

class UserService {
  async getUserProfile(id: string): Promise<IUser | null> {
    const existingUser = await User.findOne({ _id: id, isDeleted: false });
    if (!existingUser) {
      return null;
    }
    return existingUser;
  }

  async deleteUserAccount(id: string) {
    const existingUser = await User.findOne({ _id: id, isDeleted: false });
    if (!existingUser) {
      return null;
    }
    const deletedUser = await User.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true },
    );
    return deletedUser;
  }
}

export default new UserService();
