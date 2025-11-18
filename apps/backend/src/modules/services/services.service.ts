import { Service, ServiceStatus, Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { PaginationUtil, PaginatedResponse } from '@shared/utils/pagination.util.js';
import { logger } from '@shared/utils/logger.util.js';
import { CreateServiceDto } from './dto/create-service.dto.js';
import { UpdateServiceDto } from './dto/update-service.dto.js';
import { QueryServicesDto } from './dto/query-services.dto.js';

export class ServicesService {
  /**
   * Generate slug from service name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove duplicate hyphens
  }

  /**
   * Ensure slug is unique
   */
  private async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await prisma.service.findFirst({
        where: {
          slug: uniqueSlug,
          ...(excludeId && { NOT: { id: excludeId } }),
        },
      });

      if (!existing) break;

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    return uniqueSlug;
  }

  /**
   * Get all services with filters and pagination
   */
  async getServices(query: QueryServicesDto): Promise<PaginatedResponse<Service>> {
    const { page, limit } = PaginationUtil.validateParams({
      page: query.page,
      limit: query.limit,
    });

    const skip = PaginationUtil.calculateSkip(page, limit);

    // Build where clause
    const where: Prisma.ServiceWhereInput = {};

    // Search in name and description
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status as ServiceStatus;
    }

    // Build orderBy
    const orderBy: Prisma.ServiceOrderByWithRelationInput = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    // Execute query
    const [services, totalCount] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    return PaginationUtil.buildResponse(services, page, limit, totalCount);
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<Service> {
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  /**
   * Get service by slug
   */
  async getServiceBySlug(slug: string): Promise<Service> {
    const service = await prisma.service.findUnique({
      where: { slug },
    });

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    return service;
  }

  /**
   * Create new service
   */
  async createService(dto: CreateServiceDto): Promise<Service> {
    // Generate and ensure unique slug
    const baseSlug = dto.slug || this.generateSlug(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    const service = await prisma.service.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        estimatedTime: dto.estimatedTime,
        basePrice: dto.basePrice,
        specifications: dto.specifications ? dto.specifications as Prisma.InputJsonValue : Prisma.JsonNull,
        status: dto.status || ServiceStatus.ACTIVE,
        slug,
        metaDescription: dto.metaDescription,
      },
    });

    logger.info(`Service created: ${service.name} (ID: ${service.id})`);

    return service;
  }

  /**
   * Update service
   */
  async updateService(id: string, dto: UpdateServiceDto): Promise<Service> {
    // Check if service exists
    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Service not found');
    }

    // Handle slug update
    let slug = dto.slug;
    if (dto.name && dto.name !== existing.name) {
      const baseSlug = this.generateSlug(dto.name);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    } else if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    const updateData: Prisma.ServiceUpdateInput = {
      ...(dto.name && { name: dto.name }),
      ...(dto.description && { description: dto.description }),
      ...(dto.category && { category: dto.category }),
      ...(dto.estimatedTime !== undefined && { estimatedTime: dto.estimatedTime }),
      ...(dto.status && { status: dto.status }),
      ...(slug && { slug }),
      ...(dto.basePrice !== undefined && { basePrice: dto.basePrice }),
      ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
    };

    // Handle specifications separately due to Prisma JSON type
    if (dto.specifications !== undefined) {
      updateData.specifications = dto.specifications
        ? dto.specifications as Prisma.InputJsonValue
        : Prisma.JsonNull;
    }

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Service updated: ${service.name} (ID: ${service.id})`);

    return service;
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<void> {
    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw ApiError.notFound('Service not found');
    }

    await prisma.service.delete({
      where: { id },
    });

    logger.info(`Service deleted: ${service.name} (ID: ${service.id})`);
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string, limit: number = 20): Promise<Service[]> {
    return prisma.service.findMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
        status: ServiceStatus.ACTIVE,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get service categories
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await prisma.service.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        status: ServiceStatus.ACTIVE,
      },
      orderBy: {
        category: 'asc',
      },
    });

    return categories.map(cat => ({
      category: cat.category,
      count: cat._count.category,
    }));
  }
}
