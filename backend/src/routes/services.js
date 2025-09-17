// ========================================
// SERVICES ROUTES - MORIA BACKEND
// Rotas de serviços
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const ServiceController = require('../controllers/ServiceController.js');
const rateLimiter = require('../middleware/rateLimiter.js');
const DataTransformer = require('../middleware/dataTransform.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
router.get('/',
  optionalAuth,
  ServiceController.getServices
);

router.get('/popular',
  ServiceController.getPopularServices
);

router.get('/categories',
  ServiceController.getCategories
);

// TODO: Implementar searchServices no ServiceController
// router.get('/search',
//   rateLimiter.search(),
//   ServiceController.searchServices
// );

// TODO: Implementar getServicesByCategory no ServiceController
// router.get('/category/:category',
//   ServiceController.getServicesByCategory
// );

router.get('/:id',
  optionalAuth,
  ServiceController.getServiceById
);

// Rotas que requerem autenticação
router.use(authenticateToken);

router.post('/:id/book',
  ServiceController.incrementBookings
);

// Rotas administrativas (requer admin)
router.use(requireAdmin);
router.use(rateLimiter.admin()); // Rate limiting para administradores

router.post('/',
  DataTransformer.serviceTransform(),
  ServiceController.createService
);

router.put('/:id',
  DataTransformer.serviceTransform(),
  ServiceController.updateService
);

router.delete('/:id',
  ServiceController.deleteService
);

router.get('/admin/stats',
  ServiceController.getServiceStats
);

module.exports = router;