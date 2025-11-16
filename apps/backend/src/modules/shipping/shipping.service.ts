import { ShippingMethod, Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { logger } from '@shared/utils/logger.util.js';

export interface CreateShippingMethodDto {
  name: string;
  type: 'CORREIOS' | 'TRANSPORTADORA' | 'MOTOBOY' | 'RETIRADA';
  trackingUrl?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateShippingMethodDto {
  name?: string;
  type?: 'CORREIOS' | 'TRANSPORTADORA' | 'MOTOBOY' | 'RETIRADA';
  trackingUrl?: string;
  isActive?: boolean;
  order?: number;
}

export class ShippingService {
  /**
   * Get all shipping methods
   */
  async getAllMethods(activeOnly: boolean = false): Promise<ShippingMethod[]> {
    const where: Prisma.ShippingMethodWhereInput = {};

    if (activeOnly) {
      where.isActive = true;
    }

    const methods = await prisma.shippingMethod.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ],
    });

    return methods;
  }

  /**
   * Get shipping method by ID
   */
  async getMethodById(id: string): Promise<ShippingMethod> {
    const method = await prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw ApiError.notFound('Shipping method not found');
    }

    return method;
  }

  /**
   * Create shipping method
   */
  async createMethod(dto: CreateShippingMethodDto): Promise<ShippingMethod> {
    // Check if name already exists
    const existing = await prisma.shippingMethod.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw ApiError.badRequest('A shipping method with this name already exists');
    }

    const method = await prisma.shippingMethod.create({
      data: {
        name: dto.name,
        type: dto.type,
        trackingUrl: dto.trackingUrl,
        isActive: dto.isActive ?? true,
        order: dto.order ?? 0,
      },
    });

    logger.info(`Shipping method created: ${method.id} - ${method.name}`);

    return method;
  }

  /**
   * Update shipping method
   */
  async updateMethod(id: string, dto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    // Verify method exists
    await this.getMethodById(id);

    // Check if name already exists (excluding current method)
    if (dto.name) {
      const existing = await prisma.shippingMethod.findFirst({
        where: {
          name: dto.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw ApiError.badRequest('A shipping method with this name already exists');
      }
    }

    const method = await prisma.shippingMethod.update({
      where: { id },
      data: dto,
    });

    logger.info(`Shipping method updated: ${id}`);

    return method;
  }

  /**
   * Delete shipping method
   */
  async deleteMethod(id: string): Promise<void> {
    // Verify method exists
    await this.getMethodById(id);

    // Check if method is being used
    const trackingsCount = await prisma.orderTracking.count({
      where: { shippingMethodId: id },
    });

    if (trackingsCount > 0) {
      throw ApiError.badRequest('Cannot delete shipping method that has been used in orders');
    }

    await prisma.shippingMethod.delete({
      where: { id },
    });

    logger.info(`Shipping method deleted: ${id}`);
  }

  /**
   * Toggle active status
   */
  async toggleActive(id: string): Promise<ShippingMethod> {
    const method = await this.getMethodById(id);

    const updated = await prisma.shippingMethod.update({
      where: { id },
      data: { isActive: !method.isActive },
    });

    logger.info(`Shipping method ${id} active status toggled to ${updated.isActive}`);

    return updated;
  }

  /**
   * Reorder shipping methods
   */
  async reorderMethods(orderedIds: string[]): Promise<ShippingMethod[]> {
    const updates = orderedIds.map((id, index) =>
      prisma.shippingMethod.update({
        where: { id },
        data: { order: index },
      })
    );

    await prisma.$transaction(updates);

    logger.info('Shipping methods reordered');

    return this.getAllMethods();
  }

  /**
   * Get tracking URL for a specific code
   */
  getTrackingUrl(method: ShippingMethod, trackingCode: string): string | null {
    if (!method.trackingUrl) {
      return null;
    }

    return method.trackingUrl.replace('{code}', trackingCode);
  }

  /**
   * Seed default shipping methods
   */
  async seedDefaultMethods(): Promise<void> {
    const defaultMethods: CreateShippingMethodDto[] = [
      {
        name: 'Correios PAC',
        type: 'CORREIOS',
        trackingUrl: 'https://rastreamento.correios.com.br/app/index.php?codigo={code}',
        order: 1,
      },
      {
        name: 'Correios SEDEX',
        type: 'CORREIOS',
        trackingUrl: 'https://rastreamento.correios.com.br/app/index.php?codigo={code}',
        order: 2,
      },
      {
        name: 'Transportadora',
        type: 'TRANSPORTADORA',
        order: 3,
      },
      {
        name: 'Motoboy',
        type: 'MOTOBOY',
        order: 4,
      },
      {
        name: 'Retirada na Loja',
        type: 'RETIRADA',
        order: 5,
      },
    ];

    for (const methodDto of defaultMethods) {
      const existing = await prisma.shippingMethod.findUnique({
        where: { name: methodDto.name },
      });

      if (!existing) {
        await this.createMethod(methodDto);
      }
    }

    logger.info('Default shipping methods seeded');
  }
}
