import { Customer, CustomerStatus, CustomerLevel, Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { logger } from '@shared/utils/logger.util.js';

export interface AuthResponse {
  token: string;
  customer: Omit<Customer, 'password'> & {
    totalSpent: number;
  };
  requiresPasswordChange?: boolean;
}

export class AuthService {
  /**
   * Login customer
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    // Determine if input is email or phone
    const isEmail = dto.emailOrPhone.includes('@');
    const cleanPhone = dto.emailOrPhone.replace(/\D/g, ''); // Remove non-numeric chars

    // Find customer by email or phone
    let customer = null;

    if (isEmail) {
      // Login with email
      customer = await prisma.customer.findUnique({
        where: { email: dto.emailOrPhone.toLowerCase() },
      });
    } else {
      // Login with phone (without country code)
      customer = await prisma.customer.findFirst({
        where: { phone: cleanPhone },
      });
    }

    if (!customer) {
      throw ApiError.unauthorized('Invalid credentials');
    }

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
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Update last login
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    // Calculate real totalOrders and totalSpent
    const orderStats = await prisma.order.aggregate({
      where: {
        customerId: customer.id,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'],
        },
      },
      _count: { id: true },
      _sum: { total: true },
    });

    const realTotalOrders = orderStats._count.id || 0;
    const realTotalSpent = orderStats._sum.total || new Prisma.Decimal(0);

    // Generate JWT token
    const token = JwtUtil.generateToken({
      customerId: customer.id,
      email: customer.email,
      level: customer.level,
      status: customer.status,
    });

    // Remove password from response
    const { password, totalSpent, totalOrders, ...customerData } = customer;

    logger.info(`Customer logged in: ${customer.email}`);

    return {
      token,
      customer: {
        ...customerData,
        totalOrders: realTotalOrders,
        totalSpent: Number(realTotalSpent),
      } as any,
      requiresPasswordChange: customer.hasProvisionalPassword,
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
    const { password, totalSpent, totalOrders, ...customerData } = customer;

    logger.info(`New customer registered: ${customer.email}`);

    return {
      token,
      customer: {
        ...customerData,
        totalOrders,
        totalSpent: Number(totalSpent),
      } as any,
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(customerId: string): Promise<Omit<Customer, 'password'> & { totalSpent: number }> {
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

    // Calculate real totalOrders and totalSpent from orders
    const orderStats = await prisma.order.aggregate({
      where: {
        customerId: customerId,
        status: {
          in: ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'],
        },
      },
      _count: { id: true },
      _sum: { total: true },
    });

    // Update customer with real values if they differ
    const realTotalOrders = orderStats._count.id || 0;
    const realTotalSpent = orderStats._sum.total || new Prisma.Decimal(0);

    if (customer.totalOrders !== realTotalOrders || customer.totalSpent.toString() !== realTotalSpent.toString()) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: realTotalOrders,
          totalSpent: realTotalSpent,
        },
      });
    }

    const { password, totalSpent, totalOrders, ...customerData } = customer;

    // Return with updated values
    return {
      ...customerData,
      totalOrders: realTotalOrders,
      totalSpent: Number(realTotalSpent),
    } as any;
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
   * Change password (including provisional passwords)
   */
  async changePassword(
    customerId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Verify current password
    const isPasswordValid = await HashUtil.comparePassword(
      currentPassword,
      customer.password
    );

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await HashUtil.hashPassword(newPassword);

    // Update password and remove provisional flag
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        password: hashedPassword,
        hasProvisionalPassword: false,
      },
    });

    logger.info(`Password changed for customer: ${customer.email}`);
  }
}
