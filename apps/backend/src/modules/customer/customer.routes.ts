import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const customerController = new CustomerController();

// All routes require customer authentication
router.use(AuthMiddleware.authenticate);

// ==================== QUOTES ====================
router.get('/me/quotes', customerController.getMyQuotes);
router.get('/me/quotes/:id', customerController.getMyQuoteById);
router.patch('/me/quotes/:id/approve', customerController.approveMyQuote);
router.patch('/me/quotes/:id/reject', customerController.rejectMyQuote);

// ==================== ORDERS ====================
router.get('/me/orders', customerController.getMyOrders);
router.get('/me/orders/:id', customerController.getMyOrderById);

export default router;
