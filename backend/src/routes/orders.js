// ========================================
// ORDERS ROUTES - MORIA BACKEND
// Rotas de pedidos
// ========================================

const express = require('express');
const Joi = require('joi');
const { validate } = require('../utils/validations.js');
const { orderValidation, queryValidation, idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const OrderController = require('../controllers/OrderController.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
// Criar pedido (pode ser feito sem login para guests)
router.post('/',
  optionalAuth,
  validate(orderValidation.create, 'body'),
  OrderController.createOrder
);

// Obter pedido específico (com token opcional para guests)
router.get('/:id',
  optionalAuth,
  validate(Joi.object({ id: idSchema }), 'params'),
  OrderController.getOrderById
);

// Rotas que requerem autenticação
router.use(authenticateToken);

// Obter pedidos do usuário logado
router.get('/my-orders',
  validate(queryValidation.pagination, 'query'),
  validate(queryValidation.orderFilters, 'query'),
  OrderController.getMyOrders
);


// Cancelar pedido
router.put('/:id/cancel',
  validate(Joi.object({ id: idSchema }), 'params'),
  validate(Joi.object({
    reason: Joi.string().max(200).optional()
  }), 'body'),
  OrderController.cancelOrder
);

// Reordenar (criar novo pedido baseado em um anterior)
router.post('/:id/reorder',
  validate(Joi.object({ id: idSchema }), 'params'),
  OrderController.reorder
);

// Rotas administrativas (requer admin)
router.use(requireAdmin);

// Listar todos os pedidos (admin)
router.get('/',
  validate(queryValidation.pagination, 'query'),
  validate(queryValidation.orderFilters, 'query'),
  OrderController.getOrders
);

// Atualizar status do pedido (admin)
router.put('/:id/status',
  validate(Joi.object({ id: idSchema }), 'params'),
  validate(orderValidation.updateStatus, 'body'),
  OrderController.updateOrderStatus
);

// Obter estatísticas de pedidos (admin)
router.get('/admin/stats',
  validate({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional()
  }, 'query'),
  OrderController.getOrderStats
);

module.exports = router;