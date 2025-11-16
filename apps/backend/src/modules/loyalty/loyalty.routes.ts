import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const controller = new LoyaltyController();

// Public routes
router.get('/settings', controller.getSettings);

// Protected routes (customer)
router.use(AuthMiddleware.authenticate);

router.get('/stats', controller.getStats);
router.get('/transactions', controller.getTransactions);
router.get('/rewards', controller.getAvailableRewards);
router.post('/redeem', controller.redeemReward);
router.get('/redeemed', controller.getRedeemedRewards);

export default router;
