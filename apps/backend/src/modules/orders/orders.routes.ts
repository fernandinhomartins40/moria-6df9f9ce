import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const ordersController = new OrdersController();

// All order routes require authentication
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireActive);

// Order statistics
router.get('/stats', ordersController.getOrderStats);

// CRUD operations
router.post('/', ordersController.createOrder);
router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.patch('/:id', ordersController.updateOrder);

// Cancel order
router.post('/:id/cancel', ordersController.cancelOrder);

export default router;
