import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & {
        id: string;
        username: string;
        role: string;
        email?: string;
      };
    }

    interface Response {
      success: boolean;
      message: string;
      data?: object;
    }

    interface Error {
      statusCode?: number;
      message: string;
      stack?: string;
    }
  }
}
