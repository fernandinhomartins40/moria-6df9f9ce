import { Router } from 'express';
import { LoyaltyAdminController } from './loyalty-admin.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';

const router = Router();
const controller = new LoyaltyAdminController();

// All routes require admin authentication
router.use(AdminAuthMiddleware.authenticate);

// Settings
router.get('/settings', controller.getSettings);
router.put('/settings', controller.updateSettings);

// Stats
router.get('/stats', controller.getStats);

// Rewards management
router.get('/rewards', controller.getRewards);
router.post('/rewards', controller.createReward);
router.put('/rewards/:id', controller.updateReward);
router.delete('/rewards/:id', controller.deleteReward);

// Customers management
router.get('/customers', controller.getCustomersWithPoints);
router.get('/customers/:id/stats', controller.getCustomerStats);
router.get('/customers/:id/transactions', controller.getCustomerTransactions);

// Points management
router.post('/points/adjust', controller.adjustPoints);

// Redemptions
router.post('/redemptions/:code/use', controller.markRewardAsUsed);

export default router;
