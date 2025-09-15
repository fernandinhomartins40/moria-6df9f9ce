// ========================================
// SERVICES ROUTES - MORIA BACKEND
// Rotas de serviços
// ========================================

const express = require('express');
const Joi = require('joi');
const { validate } = require('../utils/validations.js');
const { serviceValidation, queryValidation, idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const ServiceController = require('../controllers/ServiceController.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
router.get('/',
  optionalAuth,
  validate(queryValidation.serviceFilters, 'query'),
  validate(queryValidation.pagination, 'query'),
  ServiceController.getServices
);

router.get('/popular',
  ServiceController.getPopularServices
);

router.get('/categories',
  ServiceController.getServiceCategories
);

router.get('/search',
  validate(queryValidation.pagination, 'query'),
  ServiceController.searchServices
);

router.get('/category/:category',
  validate(queryValidation.pagination, 'query'),
  ServiceController.getServicesByCategory
);

router.get('/:id',
  optionalAuth,
  validate(Joi.object({ id: idSchema }), 'params'),
  ServiceController.getServiceById
);

// Rotas que requerem autenticação
router.use(authenticateToken);

router.post('/:id/book',
  validate(Joi.object({ id: idSchema }), 'params'),
  ServiceController.incrementBookings
);

// Rotas administrativas (requer admin)
router.use(requireAdmin);

router.post('/',
  validate(serviceValidation.create, 'body'),
  ServiceController.createService
);

router.put('/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  validate(serviceValidation.update, 'body'),
  ServiceController.updateService
);

router.delete('/:id',
  validate(Joi.object({ id: idSchema }), 'params'),
  ServiceController.deleteService
);

router.get('/admin/stats',
  ServiceController.getServiceStats
);

module.exports = router;