import jwtService from '../APIs/authentication/jwt.service.ts';

import type { Request, Response, NextFunction } from 'express';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken: string = req.cookies['refreshToken'];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const { newAccessToken, newRefreshToken } =
      jwtService.handleRefreshToken(refreshToken);

    // Set new cookies
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      message: 'Tokens refreshed',
    });
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

export default authenticateToken;
