import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { NotificationController } from '@modules/notifications/notification.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const customerController = new CustomerController();
const notificationController = new NotificationController();

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

// ==================== NOTIFICATIONS ====================
router.get('/me/notifications', notificationController.getCustomerNotifications);
router.get('/me/notifications/unread-count', notificationController.getCustomerUnreadCount);
router.patch('/me/notifications/:id/read', notificationController.markCustomerNotificationAsRead);
router.patch('/me/notifications/read-all', notificationController.markAllCustomerNotificationsAsRead);

export default router;
