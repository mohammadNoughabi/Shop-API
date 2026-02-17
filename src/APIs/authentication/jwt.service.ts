import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

class JwtService {
  // Generate tokens (synchronous)
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: '15m',
    });
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: '7d',
    });
  }

  validateAccessToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtPayload;
  }

  validateRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtPayload;
  }

  // Token refresh endpoint logic
  handleRefreshToken(refreshToken: string): {
    newAccessToken: string;
    newRefreshToken: string;
  } {
    const decoded = this.validateRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = this.generateAccessToken({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    });

    const newRefreshToken = this.generateRefreshToken({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    });

    return { newAccessToken, newRefreshToken };
  }
}

export default new JwtService();
