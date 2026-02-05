import type { Request, Response, NextFunction } from 'express';

const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user || typeof user.role !== 'string') {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

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
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
};

export default authorizeRole;
