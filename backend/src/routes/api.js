// ============================================
// API ROUTES - SQLite Single-Tenant
// ============================================

const express = require('express');
const router = express.Router();
const { prisma, healthCheck } = require('../config/database');

// ========================================
// PLACEHOLDER IMAGES
// ========================================

router.get('/placeholder/:width/:height', (req, res) => {
  const { width = 300, height = 300 } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 300;
  
  // SVG placeholder simples
  const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
      ${w} × ${h}
    </text>
  </svg>`;

  res.set('Content-Type', 'image/svg+xml');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache por 1 dia
  res.send(svg);
});

// ========================================
// HEALTH CHECK
// ========================================

router.get('/health', async (req, res) => {
  try {
    const health = await healthCheck();
    res.json({
      success: true,
      message: 'API funcionando corretamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no health check',
      error: error.message
    });
  }
});

// ========================================
// PRODUCTS ROUTES - CRUD Completo
// ========================================

// GET /api/products - Listar produtos com filtros
router.get('/products', async (req, res) => {
  try {
    const { category, active, search } = req.query;
    
    // Construir filtros dinâmicos
    const where = {};
    
    if (category) {
      where.category = {
        contains: category,
      };
    }
    
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Transformar dados para formato do frontend
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice,
      promoPrice: product.promoPrice,
      images: product.images ? JSON.parse(product.images) : [],
      stock: product.stock,
      isActive: product.isActive,
      rating: product.rating,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      vehicleCompatibility: product.vehicleCompatibility ? JSON.parse(product.vehicleCompatibility) : [],
      createdAt: product.createdAt
    }));

    res.json({
      success: true,
      data: transformedProducts,
      total: transformedProducts.length
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos'
    });
  }
});

// GET /api/products/:id - Buscar produto específico
router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Transformar dados
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      salePrice: product.salePrice,
      promoPrice: product.promoPrice,
      images: product.images ? JSON.parse(product.images) : [],
      stock: product.stock,
      isActive: product.isActive,
      rating: product.rating,
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      vehicleCompatibility: product.vehicleCompatibility ? JSON.parse(product.vehicleCompatibility) : [],
      createdAt: product.createdAt
    };

    res.json({
      success: true,
      data: transformedProduct
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produto'
    });
  }
});

// POST /api/products - Criar produto
router.post('/products', async (req, res) => {
  try {
    const productData = req.body;
    
    // Converter arrays/objects para JSON
    if (productData.images && Array.isArray(productData.images)) {
      productData.images = JSON.stringify(productData.images);
    }
    if (productData.specifications && typeof productData.specifications === 'object') {
      productData.specifications = JSON.stringify(productData.specifications);
    }
    if (productData.vehicleCompatibility && Array.isArray(productData.vehicleCompatibility)) {
      productData.vehicleCompatibility = JSON.stringify(productData.vehicleCompatibility);
    }

    const product = await prisma.product.create({
      data: productData
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar produto'
    });
  }
});

// PUT /api/products/:id - Atualizar produto
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Converter arrays/objects para JSON
    if (productData.images && Array.isArray(productData.images)) {
      productData.images = JSON.stringify(productData.images);
    }
    if (productData.specifications && typeof productData.specifications === 'object') {
      productData.specifications = JSON.stringify(productData.specifications);
    }
    if (productData.vehicleCompatibility && Array.isArray(productData.vehicleCompatibility)) {
      productData.vehicleCompatibility = JSON.stringify(productData.vehicleCompatibility);
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: productData
    });

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar produto'
    });
  }
});

// DELETE /api/products/:id - Deletar produto
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar produto'
    });
  }
});

// ========================================
// SERVICES ROUTES - CRUD Completo
// ========================================

// GET /api/services - Listar serviços
router.get('/services', async (req, res) => {
  try {
    const { active } = req.query;
    
    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Transformar dados para formato do frontend
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      basePrice: service.basePrice,
      estimatedTime: service.estimatedTime,
      specifications: service.specifications ? JSON.parse(service.specifications) : {},
      isActive: service.isActive,
      createdAt: service.createdAt
    }));

    res.json({
      success: true,
      data: transformedServices,
      total: transformedServices.length
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar serviços'
    });
  }
});

// GET /api/services/:id - Buscar serviço específico
router.get('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }

    const transformedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      basePrice: service.basePrice,
      estimatedTime: service.estimatedTime,
      specifications: service.specifications ? JSON.parse(service.specifications) : {},
      isActive: service.isActive,
      createdAt: service.createdAt
    };

    res.json({
      success: true,
      data: transformedService
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar serviço'
    });
  }
});

// POST /api/services - Criar serviço
router.post('/services', async (req, res) => {
  try {
    const serviceData = req.body;
    
    if (serviceData.specifications && typeof serviceData.specifications === 'object') {
      serviceData.specifications = JSON.stringify(serviceData.specifications);
    }

    const service = await prisma.service.create({
      data: serviceData
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar serviço'
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const serviceData = req.body;
    
    if (serviceData.specifications && typeof serviceData.specifications === 'object') {
      serviceData.specifications = JSON.stringify(serviceData.specifications);
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: serviceData
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar serviço'
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Serviço deletado com sucesso'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Serviço não encontrado'
      });
    }
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar serviço'
    });
  }
});

// ========================================
// COUPONS ROUTES - CRUD Completo
// ========================================

// GET /api/coupons - Listar cupons
router.get('/coupons', async (req, res) => {
  try {
    const { active, type } = req.query;
    
    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    if (type) {
      where.discountType = type;
    }

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: coupons,
      total: coupons.length
    });
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar cupons'
    });
  }
});

// GET /api/coupons/:id - Buscar cupom específico
router.get('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await prisma.coupon.findUnique({
      where: { id: parseInt(id) }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupom não encontrado'
      });
    }

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Erro ao buscar cupom:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar cupom'
    });
  }
});

// POST /api/coupons - Criar cupom
router.post('/coupons', async (req, res) => {
  try {
    const coupon = await prisma.coupon.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error('Erro ao criar cupom:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar cupom'
    });
  }
});

// PUT /api/coupons/:id - Atualizar cupom
router.put('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.coupon.update({
      where: { id: parseInt(id) },
      data: req.body
    });

    res.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Cupom não encontrado'
      });
    }
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar cupom'
    });
  }
});

// DELETE /api/coupons/:id - Deletar cupom
router.delete('/coupons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.coupon.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Cupom deletado com sucesso'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Cupom não encontrado'
      });
    }
    console.error('Erro ao deletar cupom:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar cupom'
    });
  }
});

// POST /api/coupons/validate - Validar cupom
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: 'Cupom não encontrado'
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cupom inativo'
      });
    }

    const now = new Date();
    if (coupon.expiresAt && now > coupon.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Cupom expirado'
      });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        error: 'Cupom esgotado'
      });
    }

    if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
      return res.status(400).json({
        success: false,
        error: `Valor mínimo do pedido: R$ ${coupon.minimumAmount.toFixed(2)}`
      });
    }

    // Calcular desconto
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      data: {
        coupon,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar cupom'
    });
  }
});

// ========================================
// PROMOTIONS ROUTES - CRUD Completo
// ========================================

// GET /api/promotions - Listar promoções
router.get('/promotions', async (req, res) => {
  try {
    const { active, type } = req.query;
    
    const where = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }
    if (type) {
      where.type = type;
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Transformar dados
    const transformedPromotions = promotions.map(promotion => ({
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      conditions: promotion.conditions ? JSON.parse(promotion.conditions) : {},
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      maxDiscount: promotion.maxDiscount,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt
    }));

    res.json({
      success: true,
      data: transformedPromotions,
      total: transformedPromotions.length
    });
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar promoções'
    });
  }
});

// GET /api/promotions/:id - Buscar promoção específica
router.get('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await prisma.promotion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promoção não encontrada'
      });
    }

    const transformedPromotion = {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      conditions: promotion.conditions ? JSON.parse(promotion.conditions) : {},
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      maxDiscount: promotion.maxDiscount,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: promotion.isActive,
      createdAt: promotion.createdAt
    };

    res.json({
      success: true,
      data: transformedPromotion
    });
  } catch (error) {
    console.error('Erro ao buscar promoção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar promoção'
    });
  }
});

// POST /api/promotions - Criar promoção
router.post('/promotions', async (req, res) => {
  try {
    const promotionData = req.body;
    
    if (promotionData.conditions && typeof promotionData.conditions === 'object') {
      promotionData.conditions = JSON.stringify(promotionData.conditions);
    }

    const promotion = await prisma.promotion.create({
      data: promotionData
    });

    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar promoção'
    });
  }
});

// PUT /api/promotions/:id - Atualizar promoção
router.put('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promotionData = req.body;
    
    if (promotionData.conditions && typeof promotionData.conditions === 'object') {
      promotionData.conditions = JSON.stringify(promotionData.conditions);
    }

    const promotion = await prisma.promotion.update({
      where: { id: parseInt(id) },
      data: promotionData
    });

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Promoção não encontrada'
      });
    }
    console.error('Erro ao atualizar promoção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar promoção'
    });
  }
});

// DELETE /api/promotions/:id - Deletar promoção
router.delete('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.promotion.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Promoção deletada com sucesso'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Promoção não encontrada'
      });
    }
    console.error('Erro ao deletar promoção:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar promoção'
    });
  }
});

// ========================================
// ORDERS ROUTES - Sistema de Pedidos
// ========================================

// GET /api/orders - Listar pedidos
router.get('/orders', async (req, res) => {
  try {
    const { status, customer } = req.query;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    if (customer) {
      where.OR = [
        { customerName: { contains: customer, mode: 'insensitive' } },
        { customerEmail: { contains: customer, mode: 'insensitive' } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar pedidos'
    });
  }
});

// POST /api/orders - Criar pedido
router.post('/orders', async (req, res) => {
  try {
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      customerAddress,
      items,
      notes 
    } = req.body;

    // Gerar número do pedido único
    const orderNumber = `ORD-${Date.now()}`;
    
    // Calcular total
    const totalAmount = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Criar pedido com itens
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        totalAmount,
        notes,
        items: {
          create: items.map(item => ({
            type: item.type || 'product',
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity
          }))
        }
      },
      include: {
        items: true
      }
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar pedido'
    });
  }
});

// ========================================
// DASHBOARD STATS
// ========================================

router.get('/dashboard/stats', async (req, res) => {
  try {
    // Buscar estatísticas básicas
    const [
      totalProducts,
      totalOrders,
      totalServices,
      recentOrders
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.service.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalServices,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas'
    });
  }
});

// ========================================
// APP CONFIGS
// ========================================

router.get('/configs', async (req, res) => {
  try {
    const configs = await prisma.appConfig.findMany({
      orderBy: { key: 'asc' }
    });

    // Converter para objeto key-value
    const configsObject = configs.reduce((acc, config) => {
      try {
        // Tentar parse como JSON, se falhar usar como string
        acc[config.key] = JSON.parse(config.value);
      } catch {
        acc[config.key] = config.value;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: configsObject
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar configurações'
    });
  }
});

module.exports = router;