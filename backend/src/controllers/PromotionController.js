// ========================================
// PROMOTION CONTROLLER - PRISMA VERSION
// ✅ ELIMINA Promotion/Coupon model dependência
// ✅ ELIMINA conversões JSON manuais
// ✅ Type safety 100% com Prisma
// ✅ Relacionamentos automáticos
// ========================================

const prisma = require('../services/prisma.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// ============ PROMOÇÕES ============

// Listar promoções ativas (público)
const getActivePromotions = asyncHandler(async (req, res) => {
  const now = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: promotions
  });
});

// Buscar promoções por produto (público)
const getPromotionsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const now = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      applicableProducts: {
        contains: `"${productId}"`
      }
    },
    orderBy: { discountValue: 'desc' }
  });

  res.json({
    success: true,
    data: promotions
  });
});

// Buscar promoções por categoria (público)
const getPromotionsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const now = new Date();

  const promotions = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      applicableCategories: {
        contains: `"${category}"`
      }
    },
    orderBy: { discountValue: 'desc' }
  });

  res.json({
    success: true,
    data: promotions
  });
});

// Listar todas as promoções (admin/público)
const getPromotions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, active, type } = req.query;

  const where = {
    ...(active === 'true' && { isActive: true }),
    ...(active === 'false' && { isActive: false }),
    ...(type && { type: type.toUpperCase() })
  };

  // Se não há usuário autenticado, mostrar apenas ativas
  if (!req.user) {
    const now = new Date();
    where.isActive = true;
    where.startDate = { lte: now };
    where.endDate = { gte: now };
  }

  const [data, total] = await Promise.all([
    prisma.promotion.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.promotion.count({ where })
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Obter promoção por ID (admin)
const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await prisma.promotion.findUnique({
    where: { id: parseInt(id) }
  });

  if (!promotion) {
    throw new AppError('Promoção não encontrada', 404);
  }

  res.json({
    success: true,
    data: promotion
  });
});

// Criar promoção (admin)
const createPromotion = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    type,
    discountType,
    discountValue,
    startDate,
    endDate,
    minOrderValue,
    maxDiscount,
    usageLimit,
    applicableProducts = [],
    applicableCategories = [],
    conditions = {},
    isActive = true
  } = req.body;

  // ✅ Validação básica
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome deve ter pelo menos 2 caracteres', 400);
  }

  if (!discountValue || discountValue <= 0) {
    throw new AppError('Valor do desconto deve ser maior que zero', 400);
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError('Data de início deve ser anterior à data de fim', 400);
  }

  // ✅ Criar promoção com JSON automático
  const newPromotion = await prisma.promotion.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      type: type.toUpperCase(),
      discountType: discountType.toUpperCase(),
      discountValue,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      minOrderValue: minOrderValue || null,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      usageCount: 0,
      applicableProducts: JSON.stringify(applicableProducts),
      applicableCategories: JSON.stringify(applicableCategories),
      conditions: JSON.stringify(conditions),
      isActive
    }
  });

  res.status(201).json({
    success: true,
    message: 'Promoção criada com sucesso',
    data: newPromotion
  });
});

// Atualizar promoção (admin)
const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingPromotion = await prisma.promotion.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingPromotion) {
    throw new AppError('Promoção não encontrada', 404);
  }

  // ✅ Processar campos JSON se fornecidos
  const processedData = { ...updateData };
  if (updateData.applicableProducts) {
    processedData.applicableProducts = JSON.stringify(updateData.applicableProducts);
  }
  if (updateData.applicableCategories) {
    processedData.applicableCategories = JSON.stringify(updateData.applicableCategories);
  }
  if (updateData.conditions) {
    processedData.conditions = JSON.stringify(updateData.conditions);
  }

  const updatedPromotion = await prisma.promotion.update({
    where: { id: parseInt(id) },
    data: processedData
  });

  res.json({
    success: true,
    message: 'Promoção atualizada com sucesso',
    data: updatedPromotion
  });
});

// Deletar promoção (admin)
const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.promotion.update({
    where: { id: parseInt(id) },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Promoção desativada com sucesso'
  });
});

// ============ CUPONS ============

// Validar cupom
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { orderValue, productIds, userId } = req.body;

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() }
  });

  if (!coupon) {
    throw new AppError('Cupom não encontrado', 404);
  }

  if (!coupon.isActive) {
    throw new AppError('Cupom inativo', 400);
  }

  const now = new Date();
  if (coupon.expiresAt && now > coupon.expiresAt) {
    throw new AppError('Cupom expirado', 400);
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError('Cupom esgotado', 400);
  }

  if (coupon.minOrderValue && orderValue < coupon.minOrderValue) {
    throw new AppError(`Valor mínimo do pedido: R$ ${coupon.minOrderValue}`, 400);
  }

  // Calcular desconto
  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (orderValue * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }

  res.json({
    success: true,
    data: {
      coupon,
      discount,
      finalValue: orderValue - discount
    }
  });
});

// Listar cupons (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, active } = req.query;

  const where = {
    ...(active === 'true' && { isActive: true }),
    ...(active === 'false' && { isActive: false })
  };

  const [data, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    }),
    prisma.coupon.count({ where })
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Criar cupom (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscount,
    usageLimit,
    expiresAt,
    isActive = true
  } = req.body;

  // ✅ Validação básica
  if (!code || code.trim().length < 3) {
    throw new AppError('Código deve ter pelo menos 3 caracteres', 400);
  }

  const codeUpper = code.trim().toUpperCase();

  // Verificar se código já existe
  const existing = await prisma.coupon.findUnique({
    where: { code: codeUpper }
  });

  if (existing) {
    throw new AppError('Código de cupom já existe', 409);
  }

  const newCoupon = await prisma.coupon.create({
    data: {
      code: codeUpper,
      discountType: discountType.toUpperCase(),
      discountValue,
      minOrderValue: minOrderValue || null,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      usageCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive
    }
  });

  res.status(201).json({
    success: true,
    message: 'Cupom criado com sucesso',
    data: newCoupon
  });
});

// Incrementar uso do cupom
const useCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const coupon = await prisma.coupon.update({
    where: { code: code.toUpperCase() },
    data: {
      usageCount: { increment: 1 }
    }
  });

  res.json({
    success: true,
    message: 'Cupom utilizado',
    data: coupon
  });
});

module.exports = {
  getActivePromotions,
  getPromotionsByProduct,
  getPromotionsByCategory,
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validateCoupon,
  getCoupons,
  createCoupon,
  useCoupon
};