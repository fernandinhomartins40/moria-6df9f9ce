// ========================================
// PROMOTION CONTROLLER - MORIA BACKEND
// Controlador de promoções e cupons
// ========================================

const Promotion = require('../models/Promotion.js');
const Coupon = require('../models/Coupon.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// ============ PROMOÇÕES ============

// Listar promoções ativas (público)
const getActivePromotions = asyncHandler(async (req, res) => {
  const promotions = await Promotion.findActive();

  res.json({
    success: true,
    data: promotions
  });
});

// Buscar promoções por produto (público)
const getPromotionsByProduct = asyncHandler(async (req, res) => {
  const { product_id } = req.params;

  const promotions = await Promotion.findByProduct(parseInt(product_id));

  res.json({
    success: true,
    data: promotions
  });
});

// Buscar promoções por categoria (público)
const getPromotionsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const promotions = await Promotion.findByCategory(category);

  res.json({
    success: true,
    data: promotions
  });
});

// Listar todas as promoções (admin)
const getPromotions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, is_active } = req.query;

  const filters = {};
  if (is_active !== undefined) {
    filters.is_active = is_active === 'true';
  }

  const result = await Promotion.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter promoção por ID (admin)
const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findById(id);
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
  const promotionData = req.body;

  const newPromotion = await Promotion.create(promotionData);

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

  const promotion = await Promotion.findById(id);
  if (!promotion) {
    throw new AppError('Promoção não encontrada', 404);
  }

  const updatedPromotion = await Promotion.update(id, updateData);

  res.json({
    success: true,
    message: 'Promoção atualizada com sucesso',
    data: updatedPromotion
  });
});

// Deletar promoção (admin)
const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const promotion = await Promotion.findById(id);
  if (!promotion) {
    throw new AppError('Promoção não encontrada', 404);
  }

  // Soft delete
  await Promotion.update(id, { is_active: false });

  res.json({
    success: true,
    message: 'Promoção removida com sucesso'
  });
});

// ============ CUPONS ============

// Validar cupom (público)
const validateCoupon = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { order_amount = 0 } = req.query;
  const userId = req.user ? req.user.id : null;

  const validation = await Coupon.validateCoupon(code, parseFloat(order_amount), userId);

  res.json({
    success: validation.valid,
    message: validation.reason,
    data: {
      valid: validation.valid,
      discount: validation.discount,
      coupon: validation.valid ? {
        id: validation.coupon.id,
        code: validation.coupon.code,
        name: validation.coupon.name,
        description: validation.coupon.description,
        discount_type: validation.coupon.discount_type,
        discount_value: validation.coupon.discount_value,
        min_order_amount: validation.coupon.min_order_amount
      } : null
    }
  });
});

// Listar cupons ativos (público)
const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findActive();

  // Remover informações sensíveis para o público
  const publicCoupons = coupons.map(coupon => ({
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_amount: coupon.min_order_amount,
    end_date: coupon.end_date
  }));

  res.json({
    success: true,
    data: publicCoupons
  });
});

// Listar todos os cupons (admin)
const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, is_active } = req.query;

  const filters = {};
  if (is_active !== undefined) {
    filters.is_active = is_active === 'true';
  }

  const result = await Coupon.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter cupom por ID (admin)
const getCouponById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError('Cupom não encontrado', 404);
  }

  res.json({
    success: true,
    data: coupon
  });
});

// Criar cupom (admin)
const createCoupon = asyncHandler(async (req, res) => {
  const couponData = req.body;

  // Verificar se código já existe
  if (couponData.code) {
    const existingCoupon = await Coupon.findByCode(couponData.code);
    if (existingCoupon) {
      throw new AppError('Código do cupom já existe', 409);
    }
  } else {
    // Gerar código automático se não fornecido
    let uniqueCode;
    do {
      uniqueCode = Coupon.generateUniqueCode();
      const existing = await Coupon.findByCode(uniqueCode);
      if (!existing) break;
    } while (true);

    couponData.code = uniqueCode;
  }

  const newCoupon = await Coupon.create(couponData);

  res.status(201).json({
    success: true,
    message: 'Cupom criado com sucesso',
    data: newCoupon
  });
});

// Atualizar cupom (admin)
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError('Cupom não encontrado', 404);
  }

  // Verificar código duplicado se está sendo alterado
  if (updateData.code && updateData.code !== coupon.code) {
    const existingCoupon = await Coupon.findByCode(updateData.code);
    if (existingCoupon) {
      throw new AppError('Código do cupom já existe', 409);
    }
  }

  const updatedCoupon = await Coupon.update(id, updateData);

  res.json({
    success: true,
    message: 'Cupom atualizado com sucesso',
    data: updatedCoupon
  });
});

// Deletar cupom (admin)
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    throw new AppError('Cupom não encontrado', 404);
  }

  // Soft delete
  await Coupon.update(id, { is_active: false });

  res.json({
    success: true,
    message: 'Cupom removido com sucesso'
  });
});

module.exports = {
  // Promoções
  getActivePromotions,
  getPromotionsByProduct,
  getPromotionsByCategory,
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,

  // Cupons
  validateCoupon,
  getActiveCoupons,
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon
};