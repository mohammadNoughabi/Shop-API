import type { Request, Response, NextFunction } from 'express';
import logger from '../helpers/logger.ts';

const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      // Explicit type cast after check
      const role: string = user.role;

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied',
        });
      }

      next();
    } catch (error) {
      logger.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

export default authorizeRole;
