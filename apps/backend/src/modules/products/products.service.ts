import { Product, ProductStatus, Prisma } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { PaginationUtil, PaginatedResponse } from '@shared/utils/pagination.util.js';
import { logger } from '@shared/utils/logger.util.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';

export class ProductsService {
  /**
   * Generate slug from product name
   */
  private generateSlug(name: string): string {
    if (!name) return '';
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
      const existing = await prisma.product.findFirst({
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
   * Get all products with filters and pagination
   */
  async getProducts(query: QueryProductsDto): Promise<PaginatedResponse<Product>> {
    const { page, limit } = PaginationUtil.validateParams({
      page: query.page,
      limit: query.limit,
    });

    const skip = PaginationUtil.calculateSkip(page, limit);

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Search in name, description, sku
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    if (query.subcategory) {
      where.subcategory = { equals: query.subcategory, mode: 'insensitive' };
    }

    if (query.status) {
      where.status = query.status as ProductStatus;
    }

    if (query.supplier) {
      where.supplier = { contains: query.supplier, mode: 'insensitive' };
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.salePrice = {};
      if (query.minPrice !== undefined) {
        where.salePrice.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.salePrice.lte = query.maxPrice;
      }
    }

    // Stock filters
    if (query.inStock) {
      where.stock = { gt: 0 };
    }

    if (query.lowStock) {
      where.AND = [
        { stock: { gt: 0 } },
        { stock: { lte: prisma.product.fields.minStock } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {
      [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
    };

    // Execute query
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return PaginationUtil.buildResponse(products, page, limit, totalCount);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vehicleCompatibility: true,
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        vehicleCompatibility: true,
      },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { sku: sku.toUpperCase() },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  /**
   * Create new product
   */
  async createProduct(dto: CreateProductDto): Promise<Product> {
    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw ApiError.conflict(`Product with SKU "${dto.sku}" already exists`);
    }

    // Generate and ensure unique slug
    const baseSlug = dto.slug || this.generateSlug(dto.name);
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Auto set status to OUT_OF_STOCK if stock is 0
    const status = dto.stock === 0 ? ProductStatus.OUT_OF_STOCK : dto.status || ProductStatus.ACTIVE;

    const product = await prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        subcategory: dto.subcategory,
        sku: dto.sku,
        supplier: dto.supplier,
        costPrice: dto.costPrice,
        salePrice: dto.salePrice,
        promoPrice: dto.promoPrice,
        stock: dto.stock,
        minStock: dto.minStock,
        images: dto.images,
        specifications: dto.specifications || Prisma.JsonNull,
        status,
        slug,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
      },
    });

    logger.info(`Product created: ${product.name} (SKU: ${product.sku})`);

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw ApiError.notFound('Product not found');
    }

    // Check if SKU is being changed and if it's already in use
    if (dto.sku && dto.sku !== existing.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: dto.sku },
      });

      if (existingSku) {
        throw ApiError.conflict(`Product with SKU "${dto.sku}" already exists`);
      }
    }

    // Handle slug update
    let slug = dto.slug;
    if (dto.name && dto.name !== existing.name) {
      const baseSlug = this.generateSlug(dto.name);
      slug = await this.ensureUniqueSlug(baseSlug, id);
    } else if (dto.slug && dto.slug !== existing.slug) {
      slug = await this.ensureUniqueSlug(dto.slug, id);
    }

    // Auto set status to OUT_OF_STOCK if stock becomes 0
    let status = dto.status;
    if (dto.stock !== undefined && dto.stock === 0 && existing.status !== ProductStatus.DISCONTINUED) {
      status = ProductStatus.OUT_OF_STOCK;
    }

    // Build update data object
    const updateData: any = { ...dto };

    if (slug) {
      updateData.slug = slug;
    }
    if (status) {
      updateData.status = status;
    }

    // Handle JSON null values properly
    if (dto.specifications === null) {
      updateData.specifications = Prisma.JsonNull;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Product updated: ${product.name} (ID: ${product.id})`);

    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    await prisma.product.delete({
      where: { id },
    });

    logger.info(`Product deleted: ${product.name} (ID: ${product.id})`);
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    const newStock = Math.max(0, product.stock + quantity);
    const status =
      newStock === 0 && product.status !== ProductStatus.DISCONTINUED
        ? ProductStatus.OUT_OF_STOCK
        : product.status === ProductStatus.OUT_OF_STOCK && newStock > 0
        ? ProductStatus.ACTIVE
        : product.status;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        stock: newStock,
        status,
      },
    });

    logger.info(`Product stock updated: ${updatedProduct.name} (New stock: ${newStock})`);

    return updatedProduct;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        category: { equals: category, mode: 'insensitive' },
        status: ProductStatus.ACTIVE,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        AND: [
          { stock: { gt: 0 } },
          {
            stock: {
              lte: prisma.product.fields.minStock,
            },
          },
        ],
        status: { not: ProductStatus.DISCONTINUED },
      },
      orderBy: { stock: 'asc' },
    });
  }

  /**
   * Get product categories
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        status: ProductStatus.ACTIVE,
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
