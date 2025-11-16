import { Request } from 'express';
import { TokenPayload, AdminTokenPayload } from '@shared/utils/jwt.util.js';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Extended Express Request with authenticated admin
 */
export interface AdminAuthRequest extends Request {
  user?: AdminTokenPayload;
}
