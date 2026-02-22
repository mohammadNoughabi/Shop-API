import type { CreateUserInput } from './user.schema.ts';
import userService from './user.service.ts';

import type { Request, Response } from 'express';

class UserController {
  async getProfile(req: Request, res: Response): Promise<Response> {
    const id = req.user.id as string;
    const result = await userService.getUserProfile(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async createUser(req: Request, res: Response): Promise<Response> {
    const { username, email, password } = req.body as CreateUserInput;
    const result = await userService.createUser({ username, email, password });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 201).json(result);
  }

  async updatePassword(req: Request, res: Response): Promise<Response> {
    const id = req.user.id as string;
    const { newPassword } = req.body as { newPassword: string };
    const result = await userService.updateUserPassword({ id, newPassword });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async deleteAccount(req: Request, res: Response): Promise<Response> {
    const id = req.user.id as string;
    const result = await userService.deleteUserAccount(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new UserController();
