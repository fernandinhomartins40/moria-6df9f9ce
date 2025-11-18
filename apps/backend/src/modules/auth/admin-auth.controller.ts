import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from './admin-auth.service.js';
import { adminLoginSchema } from './dto/admin-login.dto.js';

export class AdminAuthController {
  private adminAuthService: AdminAuthService;

  constructor() {
    this.adminAuthService = new AdminAuthService();
  }

  /**
   * POST /auth/admin/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = adminLoginSchema.parse(req.body);
      const result = await this.adminAuthService.login(dto);

      // Set httpOnly cookie for admin
      res.cookie('adminToken', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        success: true,
        data: {
          admin: result.admin,
          // Token removido do response - agora apenas no cookie httpOnly
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/admin/profile
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const admin = await this.adminAuthService.getProfile(req.admin.adminId);

      res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /auth/admin/profile
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const admin = await this.adminAuthService.updateProfile(
        req.admin.adminId,
        req.body
      );

      res.status(200).json({
        success: true,
        data: admin,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/admin/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear httpOnly cookie
      res.clearCookie('adminToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
