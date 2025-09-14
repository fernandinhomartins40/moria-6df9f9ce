// ========================================
// ORDERS ROUTES - MORIA BACKEND
// Rotas de pedidos
// ========================================

const express = require('express');
const { validate } = require('../utils/validations.js');
const { orderValidation, queryValidation, idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const OrderController = require('../controllers/OrderController.js');

const router = express.Router();

// Todas as rotas de pedidos requerem autenticação
router.use(optionalAuth);

// Criar pedido (pode ser feito sem login para guests)
router.post('/',
  validate(orderValidation.create, 'body'),
  OrderController.createOrder
);

// Rotas que requerem autenticação
router.use(authenticateToken);

// Obter pedidos do usuário logado
router.get('/my-orders',
  validate(queryValidation.pagination, 'query'),
  validate(queryValidation.orderFilters, 'query'),
  OrderController.getMyOrders
);

// Obter pedido específico
router.get('/:id',
  validate({ id: idSchema }, 'params'),
  OrderController.getOrderById
);

// Cancelar pedido
router.put('/:id/cancel',
  validate({ id: idSchema }, 'params'),
  validate({
    reason: require('joi').string().max(200).optional()
  }, 'body'),
  OrderController.cancelOrder
);

// Reordenar (criar novo pedido baseado em um anterior)
router.post('/:id/reorder',
  validate({ id: idSchema }, 'params'),
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
  validate({ id: idSchema }, 'params'),
  validate(orderValidation.updateStatus, 'body'),
  OrderController.updateOrderStatus
);

// Obter estatísticas de pedidos (admin)
router.get('/admin/stats',
  validate({
    start_date: require('joi').date().iso().optional(),
    end_date: require('joi').date().iso().optional()
  }, 'query'),
  OrderController.getOrderStats
);

module.exports = router;