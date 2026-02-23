import jwtService from './jwt.service.ts';
import authService from './auth.service.ts';
import userService from '../user/user.service.ts';

import type { Request, Response } from 'express';

import type { RegisterInput, LoginInput } from './auth.schema.ts'; // ← assuming you export these types

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const body = req.body as RegisterInput;

    const result = await authService.register(body);

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 201).json(result);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const body = req.body as LoginInput;

    const result = await authService.login(body);

    if (!body.email && !body.username) {
      return res.status(400).json({
        success: false,
        message: 'Email or username is required',
      });
    }

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    const user = result.data!.user; // safe: success branch

    const accessToken = jwtService.generateAccessToken({
      id: String(user._id),
      username: user.username,
      role: user.role,
    });

    const refreshToken = jwtService.generateRefreshToken({
      id: String(user._id),
      username: user.username,
      role: user.role,
    });

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    return res.status(result.statusCode || 200).json(result);
  }

  logout(_req: Request, res: Response): Response {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async forgotPassword(req: Request, res: Response): Promise<Response> {
    const email = req.body.email as string;

    const userResult = await userService.findUserByEmail(email);

    if (!userResult.success) {
      return res.status(userResult.statusCode || 500).json(userResult);
    }

    const user = userResult.data!.user;

    if (!user.email) {
      return res.status(userResult.statusCode || 500).json(userResult);
    }

    // Note: storing email in session
    req.session!.email = user.email;

    const result = await authService.forgotPassword(email);

    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }

    return res.status(result.statusCode || 200).json(result);
  }

  async resetPassword(req: Request, res: Response): Promise<Response> {
    const email = req.session!.email as string | undefined;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Reset session expired or invalid',
      });
    }

    const newPassword = req.body.newPassword as string;

    const findUserResult = await userService.findUserByEmail(email);

    if (!findUserResult.success) {
      return res.status(findUserResult.statusCode || 404).json(findUserResult);
    }

    const user = findUserResult.data!.user;

    const resetPasswordResult = await authService.resetPassword(
      user.id,
      newPassword,
    );

    if (!resetPasswordResult.success) {
      return res
        .status(resetPasswordResult.statusCode || 500)
        .json(resetPasswordResult);
    }

    // Clear session after successful reset
    delete req.session!.email;

    return res
      .status(resetPasswordResult.statusCode || 200)
      .json(resetPasswordResult);
  }
}

export default new AuthController();
