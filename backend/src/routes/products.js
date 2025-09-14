// ========================================
// PRODUCTS ROUTES - MORIA BACKEND
// Rotas de produtos
// ========================================

const express = require('express');
const { validate } = require('../utils/validations.js');
const { productValidation, queryValidation, idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const ProductController = require('../controllers/ProductController.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
router.get('/',
  optionalAuth,
  validate(queryValidation.productFilters, 'query'),
  validate(queryValidation.pagination, 'query'),
  ProductController.getProducts
);

router.get('/popular',
  ProductController.getPopularProducts
);

router.get('/on-sale',
  validate(queryValidation.pagination, 'query'),
  ProductController.getProductsOnSale
);

router.get('/categories',
  ProductController.getCategories
);

router.get('/search',
  validate(queryValidation.pagination, 'query'),
  ProductController.searchProducts
);

router.get('/category/:category',
  validate(queryValidation.pagination, 'query'),
  ProductController.getProductsByCategory
);

router.get('/:id',
  optionalAuth,
  validate({ id: idSchema }, 'params'),
  ProductController.getProductById
);

// Rotas administrativas (requer autenticação e admin)
// IMPORTANTE: Rotas administrativas ficam depois das públicas
router.use(authenticateToken);
router.use(requireAdmin);

router.post('/',
  validate(productValidation.create, 'body'),
  ProductController.createProduct
);

router.put('/:id',
  validate({ id: idSchema }, 'params'),
  validate(productValidation.update, 'body'),
  ProductController.updateProduct
);

router.delete('/:id',
  validate({ id: idSchema }, 'params'),
  ProductController.deleteProduct
);

router.get('/admin/stats',
  ProductController.getProductStats
);

router.put('/:id/stock',
  validate({ id: idSchema }, 'params'),
  validate({
    stock: require('joi').number().integer().min(0).required(),
    operation: require('joi').string().valid('set', 'add', 'subtract').default('set')
  }, 'body'),
  ProductController.updateStock
);

module.exports = router;