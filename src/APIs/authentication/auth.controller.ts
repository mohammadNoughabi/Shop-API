import jwtService from './jwt.service.ts';
import authService from './auth.service.ts';

import type { Request, Response } from 'express';

// import utils
import sendEmail from '../../utils/mail.ts';

class AuthController {
  async register(req: Request, res: Response): Promise<Response | void> {
    try {
      const username: string = req.body.username;
      const email: string = req.body.email;
      const password: string = req.body.password;
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required',
        });
      }

      const createdUser = await authService.register(username, email, password);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { createdUser },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response): Promise<Response | void> {
    try {
      const email: string = req.body.email;
      const password: string = req.body.password;
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: 'Email and password are required' });
      }

      const user = await authService.login(email, password);

      // Generate JWT tokens
      const accessToken = jwtService.generateAccessToken({
        id: String(user._id),
        email: user.email,
        role: user.role,
      });
      const refreshToken = jwtService.generateRefreshToken({
        id: String(user._id),
        email: user.email,
        role: user.role,
      });

      // Send tokens in response
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  logout(req: Request, res: Response): Response {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<Response | void> {
    try {
      const email: string = req.body.email;
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'User not found' });
      }
      const reciever = user.email;
      const subject = 'Password Reset Request';
      const htmlContent = `<p>Click <a href="https://shop.com/auth/reset-password?email=${encodeURIComponent(
        reciever,
      )}">here</a> to reset your password.</p>`;
      const result = await sendEmail(reciever, subject, htmlContent);
      req.session!.email = reciever;
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        data: { result },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const email = req.session!.email;
      const newPassword: string = req.body.newPassword;
      if (!email || !newPassword) {
        {
          return res.status(400).json({
            success: false,
            message:
              'Email and new password and verification code are required',
          });
        }
      }
      const user = await authService.findUserByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: 'Usre not found' });
      }
      const updatedUser = await authService.resetPassword(
        newPassword,
        user._id.toString(),
      );
      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data: { updatedUser },
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new AuthController();
