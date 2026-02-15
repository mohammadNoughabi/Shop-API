import type { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: Express.Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
