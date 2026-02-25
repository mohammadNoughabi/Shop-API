import jwtService from '../APIs/authentication/jwt.service.ts';
import type { Request, Response, NextFunction } from 'express';
import logger from '../helpers/logger.ts';

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies['accessToken'] as string;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
      });
    }

    const decoded = jwtService.validateAccessToken(accessToken);

    // ✅ attach user to request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error(error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired access token',
    });
  }
};

export default authenticateToken;
