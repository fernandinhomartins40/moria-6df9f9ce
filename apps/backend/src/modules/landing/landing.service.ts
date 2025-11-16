import { prisma } from '@config/database.js';
import { logger } from '@shared/utils/logger.util.js';

export class LandingService {
  // Services para Landing Page - busca todos os serviços ativos
  async getServices() {
    try {
      return await prisma.service.findMany({
        where: {
          status: 'ACTIVE',
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          estimatedTime: true,
          basePrice: true,
        },
      });
    } catch (error) {
      logger.error('Error getting services:', error);
      throw error;
    }
  }

  // Produtos para Landing Page - busca produtos ativos com estoque
  async getProducts(category?: string) {
    try {
      const where: any = {
        status: 'ACTIVE',
        stock: { gt: 0 },
      };

      if (category && category !== 'Todos') {
        where.category = category;
      }

      return await prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          salePrice: true,
          promoPrice: true,
          images: true,
          stock: true,
        },
        take: 20, // Limita a 20 produtos
      });
    } catch (error) {
      logger.error('Error getting products:', error);
      throw error;
    }
  }

  // Categorias de Produtos
  async getProductCategories() {
    try {
      const categories = await prisma.product.groupBy({
        by: ['category'],
        where: {
          status: 'ACTIVE',
        },
        _count: {
          category: true,
        },
      });

      return categories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      }));
    } catch (error) {
      logger.error('Error getting product categories:', error);
      throw error;
    }
  }

  // Promoções ativas
  async getPromotions() {
    try {
      const now = new Date();

      const promotions = await prisma.promotion.findMany({
        where: {
          isActive: true,
          isDraft: false,
          startDate: { lte: now },
          endDate: { gte: now },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 10,
      });

      // Buscar produtos relacionados às promoções
      const promotionsWithProducts = await Promise.all(
        promotions.map(async (promotion) => {
          let products: any[] = [];

          if (promotion.targetProductIds) {
            const productIds = promotion.targetProductIds as string[];
            products = await prisma.product.findMany({
              where: {
                id: { in: productIds },
                status: 'ACTIVE',
              },
              select: {
                id: true,
                name: true,
                category: true,
                salePrice: true,
                promoPrice: true,
                images: true,
                stock: true,
              },
              take: 4,
            });
          } else if (promotion.targetCategories) {
            const categories = promotion.targetCategories as string[];
            products = await prisma.product.findMany({
              where: {
                category: { in: categories },
                status: 'ACTIVE',
              },
              select: {
                id: true,
                name: true,
                category: true,
                salePrice: true,
                promoPrice: true,
                images: true,
                stock: true,
              },
              take: 4,
              orderBy: { createdAt: 'desc' },
            });
          }

          return {
            id: promotion.id,
            name: promotion.name,
            description: promotion.description,
            shortDescription: promotion.shortDescription,
            bannerImage: promotion.bannerImage,
            badgeText: promotion.badgeText,
            type: promotion.type,
            startDate: promotion.startDate,
            endDate: promotion.endDate,
            code: promotion.code,
            products,
          };
        })
      );

      return promotionsWithProducts;
    } catch (error) {
      logger.error('Error getting promotions:', error);
      throw error;
    }
  }

  // Produtos em promoção
  async getPromotionalProducts() {
    try {
      return await prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          promoPrice: { not: null },
          stock: { gt: 0 },
        },
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          category: true,
          salePrice: true,
          promoPrice: true,
          images: true,
          stock: true,
        },
        take: 12,
      });
    } catch (error) {
      logger.error('Error getting promotional products:', error);
      throw error;
    }
  }
}
