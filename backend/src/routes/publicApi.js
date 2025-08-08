// ============================================
// ROTAS PÚBLICAS - APIs sem autenticação
// ============================================

const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const {
  publicRateLimit,
  searchRateLimit,
  publicSecurityMiddleware,
  cacheMiddleware,
  validateSearchFilters,
  securityMonitor
} = require('../middleware/publicSecurity');

// Aplicar middlewares a todas as rotas públicas
router.use(publicSecurityMiddleware);
router.use(securityMonitor);
router.use(publicRateLimit);

// ========================================
// HEALTH CHECK PÚBLICO
// ========================================
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API pública funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========================================
// PRODUTOS PÚBLICOS
// ========================================

/**
 * Transformar produto do banco para formato público
 */
const transformProductToPublic = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  category: product.category,
  price: product.price,
  salePrice: product.salePrice,
  promoPrice: product.promoPrice,
  images: product.images ? JSON.parse(product.images) : [],
  stock: product.stock,
  sku: product.sku,
  brand: product.brand,
  isActive: product.isActive,
  rating: product.rating,
  specifications: product.specifications ? JSON.parse(product.specifications) : {},
  vehicleCompatibility: product.vehicleCompatibility ? JSON.parse(product.vehicleCompatibility) : [],
  createdAt: product.createdAt
  // NOTA: campos sensíveis (costPrice, internalNotes, supplier) não são incluídos
});

// GET /api/public/products - Listar produtos públicos
router.get('/products', 
  cacheMiddleware(300), // Cache por 5 minutos
  validateSearchFilters,
  async (req, res) => {
    try {
      const { category, search, page = 1, limit = 20, sort = 'newest' } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 100); // Máximo 100 produtos por página
      
      // Construir filtros
      const where = {
        isActive: true,
        isPublic: true,
        status: 'published'
      };
      
      if (category && category !== 'Todos') {
        where.category = {
          contains: category,
          mode: 'insensitive'
        };
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Definir ordenação
      let orderBy;
      switch (sort) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'name':
          orderBy = { name: 'asc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      // Buscar produtos
      const products = await prisma.product.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          salePrice: true,
          promoPrice: true,
          images: true,
          stock: true,
          sku: true,
          brand: true,
          isActive: true,
          rating: true,
          specifications: true,
          vehicleCompatibility: true,
          createdAt: true
          // costPrice, internalNotes, supplier são excluídos automaticamente
        }
      });

      // Contar total
      const total = await prisma.product.count({ where });
      const totalPages = Math.ceil(total / take);

      // Transformar dados
      const transformedProducts = products.map(transformProductToPublic);

      res.json({
        success: true,
        data: transformedProducts,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages,
          hasMore: parseInt(page) < totalPages
        },
        filters: {
          category: category || null,
          search: search || null,
          sort
        }
      });
    } catch (error) {
      console.error('Erro ao buscar produtos públicos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// GET /api/public/products/:id - Buscar produto público específico
router.get('/products/:id', 
  cacheMiddleware(600), // Cache por 10 minutos
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!Number.isInteger(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'ID do produto inválido'
        });
      }

      const product = await prisma.product.findFirst({
        where: {
          id: parseInt(id),
          isActive: true,
          isPublic: true,
          status: 'published'
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          price: true,
          salePrice: true,
          promoPrice: true,
          images: true,
          stock: true,
          sku: true,
          brand: true,
          isActive: true,
          rating: true,
          specifications: true,
          vehicleCompatibility: true,
          createdAt: true
        }
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      const transformedProduct = transformProductToPublic(product);

      res.json({
        success: true,
        data: transformedProduct
      });
    } catch (error) {
      console.error('Erro ao buscar produto público:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// GET /api/public/products/categories - Listar categorias públicas
router.get('/products/categories', 
  cacheMiddleware(3600), // Cache por 1 hora
  async (req, res) => {
    try {
      const categories = await prisma.product.findMany({
        where: {
          isActive: true,
          isPublic: true,
          status: 'published'
        },
        select: {
          category: true
        },
        distinct: ['category']
      });

      const categoryList = categories.map(p => p.category).filter(Boolean).sort();

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Erro ao buscar categorias públicas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ========================================
// SERVIÇOS PÚBLICOS
// ========================================

/**
 * Transformar serviço do banco para formato público
 */
const transformServiceToPublic = (service) => ({
  id: service.id,
  name: service.name,
  description: service.description,
  category: service.category,
  basePrice: service.basePrice,
  estimatedTime: service.estimatedTime,
  specifications: service.specifications ? JSON.parse(service.specifications) : {},
  isActive: service.isActive,
  createdAt: service.createdAt
  // internalCost e internalNotes são excluídos
});

// GET /api/public/services - Listar serviços públicos
router.get('/services',
  cacheMiddleware(600), // Cache por 10 minutos
  validateSearchFilters,
  async (req, res) => {
    try {
      const { category, search, page = 1, limit = 20 } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = Math.min(parseInt(limit), 50);
      
      const where = {
        isActive: true,
        isPublic: true,
        status: 'published'
      };
      
      if (category) {
        where.category = {
          contains: category,
          mode: 'insensitive'
        };
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      const services = await prisma.service.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          basePrice: true,
          estimatedTime: true,
          specifications: true,
          isActive: true,
          createdAt: true
        }
      });

      const total = await prisma.service.count({ where });
      const totalPages = Math.ceil(total / take);

      const transformedServices = services.map(transformServiceToPublic);

      res.json({
        success: true,
        data: transformedServices,
        pagination: {
          page: parseInt(page),
          limit: take,
          total,
          totalPages,
          hasMore: parseInt(page) < totalPages
        }
      });
    } catch (error) {
      console.error('Erro ao buscar serviços públicos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// GET /api/public/services/:id - Buscar serviço público específico
router.get('/services/:id',
  cacheMiddleware(600),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!Number.isInteger(Number(id))) {
        return res.status(400).json({
          success: false,
          error: 'ID do serviço inválido'
        });
      }

      const service = await prisma.service.findFirst({
        where: {
          id: parseInt(id),
          isActive: true,
          isPublic: true,
          status: 'published'
        },
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          basePrice: true,
          estimatedTime: true,
          specifications: true,
          isActive: true,
          createdAt: true
        }
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Serviço não encontrado'
        });
      }

      const transformedService = transformServiceToPublic(service);

      res.json({
        success: true,
        data: transformedService
      });
    } catch (error) {
      console.error('Erro ao buscar serviço público:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ========================================
// PROMOÇÕES PÚBLICAS
// ========================================

/**
 * Transformar promoção do banco para formato público
 */
const transformPromotionToPublic = (promotion) => ({
  id: promotion.id,
  title: promotion.title,
  description: promotion.description,
  discountType: promotion.discountType,
  discountValue: promotion.discountValue,
  category: promotion.category,
  minAmount: promotion.minAmount,
  startDate: promotion.startDate,
  endDate: promotion.endDate,
  isActive: promotion.isActive,
  createdAt: promotion.createdAt
});

// GET /api/public/promotions - Listar promoções públicas ativas
router.get('/promotions',
  cacheMiddleware(300), // Cache por 5 minutos
  async (req, res) => {
    try {
      const now = new Date();
      
      const promotions = await prisma.promotion.findMany({
        where: {
          isActive: true,
          isPublic: true,
          status: 'published',
          startDate: { lte: now },
          endDate: { gte: now }
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          discountType: true,
          discountValue: true,
          category: true,
          minAmount: true,
          startDate: true,
          endDate: true,
          isActive: true,
          createdAt: true
        }
      });

      const transformedPromotions = promotions.map(transformPromotionToPublic);

      res.json({
        success: true,
        data: transformedPromotions,
        total: transformedPromotions.length
      });
    } catch (error) {
      console.error('Erro ao buscar promoções públicas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ========================================
// BUSCA GLOBAL PÚBLICA
// ========================================
router.get('/search',
  searchRateLimit, // Rate limiting específico para buscas
  validateSearchFilters,
  async (req, res) => {
    try {
      const { q: query, category, limit = 10 } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Termo de busca deve ter pelo menos 2 caracteres'
        });
      }

      const searchLimit = Math.min(parseInt(limit), 20);
      
      // Buscar produtos
      const productWhere = {
        isActive: true,
        isPublic: true,
        status: 'published',
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      };
      
      if (category) {
        productWhere.category = { contains: category, mode: 'insensitive' };
      }

      const [products, services] = await Promise.all([
        prisma.product.findMany({
          where: productWhere,
          take: searchLimit,
          select: {
            id: true,
            name: true,
            category: true,
            price: true,
            images: true
          }
        }),
        prisma.service.findMany({
          where: {
            isActive: true,
            isPublic: true,
            status: 'published',
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: searchLimit,
          select: {
            id: true,
            name: true,
            category: true,
            basePrice: true
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          products: products.map(p => ({
            ...p,
            type: 'product',
            images: p.images ? JSON.parse(p.images) : []
          })),
          services: services.map(s => ({
            ...s,
            type: 'service'
          }))
        },
        query,
        total: products.length + services.length
      });
    } catch (error) {
      console.error('Erro na busca pública:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

// ========================================
// INFORMAÇÕES GERAIS PÚBLICAS
// ========================================
router.get('/info',
  cacheMiddleware(3600), // Cache por 1 hora
  async (req, res) => {
    try {
      // Buscar estatísticas básicas
      const [productCount, serviceCount, categoryCount] = await Promise.all([
        prisma.product.count({
          where: { isActive: true, isPublic: true, status: 'published' }
        }),
        prisma.service.count({
          where: { isActive: true, isPublic: true, status: 'published' }
        }),
        prisma.product.findMany({
          where: { isActive: true, isPublic: true, status: 'published' },
          select: { category: true },
          distinct: ['category']
        })
      ]);

      res.json({
        success: true,
        data: {
          statistics: {
            products: productCount,
            services: serviceCount,
            categories: categoryCount.length
          },
          company: {
            name: 'Moria Peças & Serviços',
            founded: '2009',
            experience: '15+ anos',
            location: 'São Paulo, SP'
          },
          contact: {
            phone: '(11) 99999-9999',
            email: 'contato@moriapecas.com.br',
            whatsapp: '5511999999999'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar informações públicas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
);

module.exports = router;