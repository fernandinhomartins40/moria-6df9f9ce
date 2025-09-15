// ========================================
// PROMOTIONS ROUTES - MORIA BACKEND
// Rotas de promoções e cupons
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const PromotionController = require('../controllers/PromotionController.js');

const router = express.Router();

// ============ ROTAS PÚBLICAS - PROMOÇÕES ============

// Buscar promoções ativas
router.get('/active',
  PromotionController.getActivePromotions
);

// Buscar promoções por produto
router.get('/product/:product_id',
  PromotionController.getPromotionsByProduct
);

// Buscar promoções por categoria
router.get('/category/:category',
  PromotionController.getPromotionsByCategory
);

// ============ ROTAS PÚBLICAS - CUPONS ============

// Validar cupom
router.get('/coupons/validate/:code',
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
  PromotionController.getPromotions
);

// Obter promoção por ID
router.get('/:id',
  PromotionController.getPromotionById
);

// Criar promoção
router.post('/',
  PromotionController.createPromotion
);

// Atualizar promoção
router.put('/:id',
  PromotionController.updatePromotion
);

// Deletar promoção
router.delete('/:id',
  PromotionController.deletePromotion
);

// === CUPONS (Admin) ===

// Listar todos os cupons
router.get('/coupons/',
  PromotionController.getCoupons
);

// Obter cupom por ID
router.get('/coupons/:id',
  PromotionController.getCouponById
);

// Criar cupom
router.post('/coupons/',
  PromotionController.createCoupon
);

// Atualizar cupom
router.put('/coupons/:id',
  PromotionController.updateCoupon
);

// Deletar cupom
router.delete('/coupons/:id',
  PromotionController.deleteCoupon
);

module.exports = router;