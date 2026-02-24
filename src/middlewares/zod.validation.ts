// middlewares/validate.ts
import { ZodError } from 'zod';

import type { ZodType } from 'zod';
import type { Request, Response, NextFunction } from 'express';

const validate =
  (schema: ZodType<unknown>) =>
  (req: Request, res: Response, next: NextFunction): Response | void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      files: req.files,
      file: req.file,
    });

    if (!result.success) {
      const error = result.error;
      console.log(`[ZOD ERROR] : ${error}`);

      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request',
      });
    }

    return next();
  };

export default validate;
