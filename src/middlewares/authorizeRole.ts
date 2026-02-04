import jwtService from '../APIs/authentication/jwt.service.ts';
import type { Request, Response, NextFunction } from 'express';

const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken: string = req.cookies.refreshToken;
      if (!refreshToken) {
        return res
          .status(401)
          .json({ success: false, message: 'No token provided' });
      }
      const decoded = jwtService.validateRefreshToken(refreshToken);
      if (!allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden: Access denied' });
      }
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };
};

export default authorizeRole;
