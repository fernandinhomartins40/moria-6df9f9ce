import { Router } from 'express';
import { OrdersController } from './orders.controller.js';
import { GuestOrdersController } from './guest-orders.controller.js';
import { AuthMiddleware, authenticateAdmin } from '@middlewares/auth.middleware.js';

const router = Router();
const ordersController = new OrdersController();
const guestOrdersController = new GuestOrdersController();

// Guest order route (no authentication required)
router.post('/guest', guestOrdersController.createGuestOrder);

// All other order routes require authentication
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

// Tracking endpoints (admin only for create/update/delete, public for read)
router.get('/:id/tracking', ordersController.getTracking);
router.post('/:id/tracking', authenticateAdmin, ordersController.addTracking);
router.patch('/:id/tracking', authenticateAdmin, ordersController.updateTracking);
router.delete('/:id/tracking', authenticateAdmin, ordersController.deleteTracking);

export default router;
