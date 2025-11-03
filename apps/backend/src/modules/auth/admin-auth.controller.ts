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

      res.status(200).json({
        success: true,
        data: result,
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
      // In JWT, logout is handled client-side by removing the token
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
