import type { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

const errorHandler = (
  err: Express.Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  console.error('EXPRESS GLOBAL ERROR:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  next(err);
  // Optional: send better response in tests
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Unknown error',
    stack: err.stack, // only in dev/test
  });
};

export default errorHandler;
