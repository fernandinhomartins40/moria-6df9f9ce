import jwt, { JwtPayload } from 'jsonwebtoken';
import { environment } from '@config/environment.js';

export interface TokenPayload {
  customerId: string;
  email: string;
  level: string;
  status: string;
}

export class JwtUtil {
  /**
   * Generate JWT token
   */
  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, environment.jwt.secret, {
      expiresIn: environment.jwt.expiresIn,
      issuer: 'moria-backend',
      audience: 'moria-frontend',
    });
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, environment.jwt.secret, {
        issuer: 'moria-backend',
        audience: 'moria-frontend',
      }) as JwtPayload;

      return {
        customerId: decoded.customerId,
        email: decoded.email,
        level: decoded.level,
        status: decoded.status,
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded) return null;

      return {
        customerId: decoded.customerId,
        email: decoded.email,
        level: decoded.level,
        status: decoded.status,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
}
