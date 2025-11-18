import { Admin, AdminStatus } from '@prisma/client';
import { prisma } from '@config/database.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { AdminLoginDto } from './dto/admin-login.dto.js';
import { logger } from '@shared/utils/logger.util.js';

export interface AdminAuthResponse {
  token: string;
  admin: Omit<Admin, 'password'>;
}

export class AdminAuthService {
  /**
   * Login admin
   */
  async login(dto: AdminLoginDto): Promise<AdminAuthResponse> {
    try {
      logger.info(`Admin login attempt: ${dto.email}`);

      // Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email: dto.email },
      });

      if (!admin) {
        logger.warn(`Admin login failed - email not found: ${dto.email}`);
        throw ApiError.unauthorized('Invalid email or password');
      }

      logger.info(`Admin found: ${admin.email}, status: ${admin.status}`);

      // Check if admin is active
      if (admin.status !== AdminStatus.ACTIVE) {
        logger.warn(`Admin login failed - account not active: ${dto.email}`);
        throw ApiError.forbidden('Your account is not active');
      }

      // Verify password
      logger.info('Verifying password...');
      const isPasswordValid = await HashUtil.comparePassword(
        dto.password,
        admin.password
      );

      if (!isPasswordValid) {
        logger.warn(`Admin login failed - invalid password: ${dto.email}`);
        throw ApiError.unauthorized('Invalid email or password');
      }

      logger.info('Password verified successfully');

      // Update last login
      logger.info('Updating last login timestamp...');
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT token
      logger.info('Generating JWT token...');
      const token = JwtUtil.generateAdminToken({
        adminId: admin.id,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      });

      // Remove password from response
      const { password, ...adminWithoutPassword } = admin;

      logger.info(`Admin logged in successfully: ${admin.email}`);

      return {
        token,
        admin: adminWithoutPassword,
      };
    } catch (error) {
      logger.error('Admin login error:', error);
      throw error;
    }
  }

  /**
   * Get admin profile
   */
  async getProfile(adminId: string): Promise<Omit<Admin, 'password'>> {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw ApiError.notFound('Admin not found');
    }

    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }

  /**
   * Update admin profile
   */
  async updateProfile(
    adminId: string,
    data: {
      name?: string;
    }
  ): Promise<Omit<Admin, 'password'>> {
    const admin = await prisma.admin.update({
      where: { id: adminId },
      data,
    });

    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  }
}
