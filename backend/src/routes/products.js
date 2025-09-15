// ========================================
// PRODUCTS ROUTES - MORIA BACKEND
// Rotas de produtos
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const ProductController = require('../controllers/ProductController.js');
const rateLimiter = require('../middleware/rateLimiter.js');
const DataTransformer = require('../middleware/dataTransform.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
router.get('/',
  optionalAuth,
  ProductController.getProducts
);

router.get('/popular',
  ProductController.getPopularProducts
);

router.get('/on-sale',
  ProductController.getProductsOnSale
);

router.get('/categories',
  ProductController.getCategories
);

router.get('/search',
  rateLimiter.search(),
  ProductController.searchProducts
);

router.get('/category/:category',
  ProductController.getProductsByCategory
);

// Rotas de favoritos - DEVEM vir antes da rota /:id
router.get('/favorites',
  ProductController.getFavorites
);

router.get('/:id',
  optionalAuth,
  ProductController.getProductById
);

// Rotas administrativas (requer autenticação e admin)
// IMPORTANTE: Rotas administrativas ficam depois das públicas
router.use(authenticateToken);
router.use(requireAdmin);
router.use(rateLimiter.admin()); // Rate limiting para administradores

router.post('/',
  DataTransformer.productTransform(),
  ProductController.createProduct
);

router.put('/:id',
  DataTransformer.productTransform(),
  ProductController.updateProduct
);

router.patch('/:id',
  DataTransformer.productTransform(),
  ProductController.updateProduct
);

router.delete('/:id',
  ProductController.deleteProduct
);

router.get('/admin/stats',
  ProductController.getProductStats
);

router.put('/:id/stock',
  ProductController.updateStock
);

// Rotas de favoritos (que requerem autenticação)
router.post('/:id/favorite',
  ProductController.addToFavorites
);

router.delete('/:id/favorite',
  ProductController.removeFromFavorites
);

module.exports = router;