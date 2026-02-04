import userService from './user.service';

import type { Request, Response } from 'express';

class UserController {
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id as string;
      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing userId' });
      }
      const user = await userService.getUserProfile(id);
      return res.status(200).json({
        success: true,
        message: 'User found successfully',
        data: { user },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const deletedUser = await userService.deleteUserAccount(id);
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: { deletedUser },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new UserController();
