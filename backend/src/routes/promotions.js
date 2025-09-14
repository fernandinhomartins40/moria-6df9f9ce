// ========================================
// PROMOTIONS ROUTES - MORIA BACKEND
// Rotas de promoções e cupons
// ========================================

const express = require('express');
const { validate } = require('../utils/validations.js');
const { queryValidation, idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const PromotionController = require('../controllers/PromotionController.js');
const Joi = require('joi');

const router = express.Router();

// ============ ROTAS PÚBLICAS - PROMOÇÕES ============

// Buscar promoções ativas
router.get('/active',
  PromotionController.getActivePromotions
);

// Buscar promoções por produto
router.get('/product/:product_id',
  validate(Joi.object({ product_id: idSchema }), 'params'),
  PromotionController.getPromotionsByProduct
);

// Buscar promoções por categoria
router.get('/category/:category',
  validate(Joi.object({ category: Joi.string().required() }), 'params'),
  PromotionController.getPromotionsByCategory
);

// ============ ROTAS PÚBLICAS - CUPONS ============

// Validar cupom
router.get('/coupons/validate/:code',
  validate(Joi.object({ code: Joi.string().required() }), 'params'),
  validate(Joi.object({ order_amount: Joi.number().positive().optional() }), 'query'),
  optionalAuth,
  PromotionController.validateCoupon
);

// Listar cupons ativos (públicos)
router.get('/coupons/active',
  PromotionController.getActiveCoupons
);

// ============ ROTAS ADMINISTRATIVAS ============
router.use(authenticateToken);
router.use(requireAdmin);

// === PROMOÇÕES (Admin) ===

// Listar todas as promoções (admin)
router.get('/',
  validate(queryValidation.pagination, 'query'),
  validate(Joi.object({ is_active: Joi.boolean().optional() }), 'query'),
  PromotionController.getPromotions
);

// Obter promoção por ID
router.get('/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  PromotionController.getPromotionById
);

// Criar promoção
router.post('/',
  validate({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y').required(),
    is_active: Joi.boolean().default(true),
    discount_value: Joi.number().positive().precision(2).optional(),
    min_quantity: Joi.number().integer().min(0).default(0),
    min_amount: Joi.number().positive().precision(2).default(0),
    buy_quantity: Joi.number().integer().positive().optional(),
    get_quantity: Joi.number().integer().positive().optional(),
    applicable_products: Joi.array().items(Joi.number().integer()).default([]),
    applicable_categories: Joi.array().items(Joi.string()).default([]),
    excluded_products: Joi.array().items(Joi.number().integer()).default([]),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    usage_limit_per_user: Joi.number().integer().positive().optional(),
    priority: Joi.number().integer().default(0),
    stackable: Joi.boolean().default(false),
    conditions: Joi.object().default({})
  }, 'body'),
  PromotionController.createPromotion
);

// Atualizar promoção
router.put('/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  validate({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    type: Joi.string().valid('percentage', 'fixed_amount', 'buy_x_get_y').optional(),
    is_active: Joi.boolean().optional(),
    discount_value: Joi.number().positive().precision(2).optional(),
    min_quantity: Joi.number().integer().min(0).optional(),
    min_amount: Joi.number().positive().precision(2).optional(),
    buy_quantity: Joi.number().integer().positive().optional(),
    get_quantity: Joi.number().integer().positive().optional(),
    applicable_products: Joi.array().items(Joi.number().integer()).optional(),
    applicable_categories: Joi.array().items(Joi.string()).optional(),
    excluded_products: Joi.array().items(Joi.number().integer()).optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    usage_limit_per_user: Joi.number().integer().positive().optional(),
    priority: Joi.number().integer().optional(),
    stackable: Joi.boolean().optional(),
    conditions: Joi.object().optional()
  }, 'body'),
  PromotionController.updatePromotion
);

// Deletar promoção
router.delete('/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  PromotionController.deletePromotion
);

// === CUPONS (Admin) ===

// Listar todos os cupons
router.get('/coupons/',
  validate(queryValidation.pagination, 'query'),
  validate(Joi.object({ is_active: Joi.boolean().optional() }), 'query'),
  PromotionController.getCoupons
);

// Obter cupom por ID
router.get('/coupons/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  PromotionController.getCouponById
);

// Criar cupom
router.post('/coupons/',
  validate({
    code: Joi.string().max(20).optional(),
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    is_active: Joi.boolean().default(true),
    discount_type: Joi.string().valid('percentage', 'fixed_amount').required(),
    discount_value: Joi.number().positive().precision(2).required(),
    min_order_amount: Joi.number().positive().precision(2).default(0),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    usage_limit_per_user: Joi.number().integer().positive().optional(),
    applicable_products: Joi.array().items(Joi.number().integer()).default([]),
    applicable_categories: Joi.array().items(Joi.string()).default([]),
    excluded_products: Joi.array().items(Joi.number().integer()).default([]),
    first_purchase_only: Joi.boolean().default(false),
    allowed_users: Joi.array().items(Joi.number().integer()).default([]),
    stackable: Joi.boolean().default(false),
    max_discount_amount: Joi.number().positive().precision(2).optional()
  }, 'body'),
  PromotionController.createCoupon
);

// Atualizar cupom
router.put('/coupons/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  validate({
    code: Joi.string().max(20).optional(),
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    is_active: Joi.boolean().optional(),
    discount_type: Joi.string().valid('percentage', 'fixed_amount').optional(),
    discount_value: Joi.number().positive().precision(2).optional(),
    min_order_amount: Joi.number().positive().precision(2).optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    usage_limit_per_user: Joi.number().integer().positive().optional(),
    applicable_products: Joi.array().items(Joi.number().integer()).optional(),
    applicable_categories: Joi.array().items(Joi.string()).optional(),
    excluded_products: Joi.array().items(Joi.number().integer()).optional(),
    first_purchase_only: Joi.boolean().optional(),
    allowed_users: Joi.array().items(Joi.number().integer()).optional(),
    stackable: Joi.boolean().optional(),
    max_discount_amount: Joi.number().positive().precision(2).optional()
  }, 'body'),
  PromotionController.updateCoupon
);

// Deletar cupom
router.delete('/coupons/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  PromotionController.deleteCoupon
);

module.exports = router;