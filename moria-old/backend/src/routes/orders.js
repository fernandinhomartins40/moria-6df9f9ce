// ========================================
// ORDERS ROUTES - MORIA BACKEND
// Rotas de pedidos
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const OrderController = require('../controllers/OrderController.js');

const router = express.Router();

// Rotas públicas (sem autenticação obrigatória)
// Criar pedido (pode ser feito sem login para guests)
router.post('/',
  optionalAuth,
  OrderController.createOrder
);

// Obter pedido específico (com token opcional para guests)
router.get('/:id',
  optionalAuth,
  OrderController.getOrderById
);

// Rotas que requerem autenticação
router.use(authenticateToken);

// Obter pedidos do usuário logado
router.get('/my-orders',
  OrderController.getMyOrders
);


// Cancelar pedido
router.put('/:id/cancel',
  OrderController.cancelOrder
);

// Reordenar (criar novo pedido baseado em um anterior)
router.post('/:id/reorder',
  OrderController.reorder
);

// Rotas administrativas (requer admin)
router.use(requireAdmin);

// Listar todos os pedidos (admin)
router.get('/',
  OrderController.getOrders
);

// Atualizar status do pedido (admin)
router.put('/:id/status',
  OrderController.updateOrderStatus
);

// Obter estatísticas de pedidos (admin)
router.get('/admin/stats',
  OrderController.getOrderStats
);

module.exports = router;