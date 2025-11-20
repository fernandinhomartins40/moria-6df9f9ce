import { Customer, CustomerStatus, CustomerLevel } from '@prisma/client';
import { prisma } from '@config/database.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { logger } from '@shared/utils/logger.util.js';

export interface AuthResponse {
  token: string;
  customer: Omit<Customer, 'password'>;
}

export class AuthService {
  /**
   * Login customer
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find customer by phone or email
    // Check if identifier is email (contains @) or phone
    const isEmail = dto.identifier.includes('@');
    const searchValue = isEmail ? dto.identifier.toLowerCase() : dto.identifier.replace(/\D/g, '');

    logger.info(`Login attempt - isEmail: ${isEmail}, original: ${dto.identifier}, searchValue: ${searchValue}`);

    const customer = await prisma.customer.findFirst({
      where: isEmail
        ? { email: searchValue }
        : { phone: searchValue }
    });

    if (!customer) {
      logger.info(`Customer not found with ${isEmail ? 'email' : 'phone'}: ${searchValue}`);
      throw ApiError.unauthorized('Invalid phone/email or password');
    }

    logger.info(`Customer found: ${customer.email}, phone: ${customer.phone}`);

    // Check if customer is blocked
    if (customer.status === CustomerStatus.BLOCKED) {
      throw ApiError.forbidden('Your account has been blocked');
    }

    // Verify password
    const isPasswordValid = await HashUtil.comparePassword(
      dto.password,
      customer.password
    );

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid phone/email or password');
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token
    const token = JwtUtil.generateToken({
      customerId: customer.id,
      email: customer.email,
      level: customer.level,
      status: customer.status,
    });

    // Remove password from response
    const { password, ...customerWithoutPassword } = customer;

    logger.info(`Customer logged in: ${customer.email}`);

    return {
      token,
      customer: customerWithoutPassword,
    };
  }

  /**
   * Register new customer
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existingCustomer) {
      throw ApiError.conflict('Email already registered');
    }

    // Check if CPF already exists (if provided)
    if (dto.cpf) {
      const existingCpf = await prisma.customer.findUnique({
        where: { cpf: dto.cpf },
      });

      if (existingCpf) {
        throw ApiError.conflict('CPF already registered');
      }
    }

    // Hash password
    const hashedPassword = await HashUtil.hashPassword(dto.password);

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
        cpf: dto.cpf,
        status: CustomerStatus.ACTIVE,
        level: CustomerLevel.BRONZE,
        lastLoginAt: new Date(),
      },
    });

    // Generate JWT token
    const token = JwtUtil.generateToken({
      customerId: customer.id,
      email: customer.email,
      level: customer.level,
      status: customer.status,
    });

    // Remove password from response
    const { password, ...customerWithoutPassword } = customer;

    logger.info(`New customer registered: ${customer.email}`);

    return {
      token,
      customer: customerWithoutPassword,
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(customerId: string): Promise<Omit<Customer, 'password'>> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    customerId: string,
    data: {
      name?: string;
      phone?: string;
      cpf?: string;
      birthDate?: Date;
    }
  ): Promise<Omit<Customer, 'password'>> {
    // Check if CPF is being changed and if it's already in use
    if (data.cpf) {
      const existingCpf = await prisma.customer.findFirst({
        where: {
          cpf: data.cpf,
          NOT: { id: customerId },
        },
      });

      if (existingCpf) {
        throw ApiError.conflict('CPF already in use');
      }
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data,
    });

    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  /**
   * Change customer password
   */
  async changePassword(
    customerId: string,
    dto: ChangePasswordDto
  ): Promise<void> {
    try {
      logger.info(`Password change attempt for customer: ${customerId}`);

      // Find customer
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw ApiError.notFound('Customer not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await HashUtil.comparePassword(
        dto.currentPassword,
        customer.password
      );

      if (!isCurrentPasswordValid) {
        logger.warn(`Password change failed - invalid current password: ${customer.email}`);
        throw ApiError.unauthorized('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await HashUtil.hashPassword(dto.newPassword);

      // Update password
      await prisma.customer.update({
        where: { id: customerId },
        data: { password: hashedNewPassword },
      });

      logger.info(`Password changed successfully for customer: ${customer.email}`);
    } catch (error) {
      logger.error('Password change error:', error);
      throw error;
    }
  }
}
