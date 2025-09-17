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

// TODO: Implementar getActiveCoupons no PromotionController
// router.get('/coupons/active',
//   PromotionController.getActiveCoupons
// );

// TODO: Implementar getActiveCoupons no PromotionController
// router.get('/coupons/',
//   PromotionController.getActiveCoupons
// );

// Listar promoções (rota pública para parâmetros active=true)
router.get('/',
  PromotionController.getPromotions
);

// ============ ROTAS ADMINISTRATIVAS ============
router.use(authenticateToken);
router.use(requireAdmin);

// === PROMOÇÕES (Admin) ===

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

// Listar todos os cupons (admin)
router.get('/admin/coupons/',
  PromotionController.getCoupons
);

// TODO: Implementar getCouponById no PromotionController
// router.get('/admin/coupons/:id',
//   PromotionController.getCouponById
// );

// Criar cupom (admin)
router.post('/admin/coupons/',
  PromotionController.createCoupon
);

// TODO: Implementar updateCoupon no PromotionController
// router.put('/admin/coupons/:id',
//   PromotionController.updateCoupon
// );

// TODO: Implementar deleteCoupon no PromotionController
// router.delete('/admin/coupons/:id',
//   PromotionController.deleteCoupon
// );

module.exports = router;