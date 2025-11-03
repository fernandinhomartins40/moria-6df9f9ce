import { Customer, CustomerStatus, CustomerLevel } from '@prisma/client';
import { prisma } from '@config/database.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { JwtUtil } from '@shared/utils/jwt.util.js';
import { ApiError } from '@shared/utils/error.util.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
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
    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (!customer) {
      throw ApiError.unauthorized('Invalid email or password');
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
}
