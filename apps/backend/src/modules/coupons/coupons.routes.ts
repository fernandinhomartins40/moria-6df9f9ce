import { Router } from 'express';
import { CouponsController } from './coupons.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const couponsController = new CouponsController();

// Public routes
router.post('/validate', couponsController.validateCoupon);
router.get('/active', couponsController.getActiveCoupons);

// Protected routes (require authentication)
router.use(AuthMiddleware.authenticate);

// Admin routes (for creating/managing coupons)
router.post('/', couponsController.createCoupon);
router.get('/', couponsController.getCoupons);
router.get('/:id', couponsController.getCouponById);
router.patch('/:id', couponsController.updateCoupon);
router.delete('/:id', couponsController.deleteCoupon);

// Coupon actions
router.post('/:id/activate', couponsController.activateCoupon);
router.post('/:id/deactivate', couponsController.deactivateCoupon);
router.get('/:id/stats', couponsController.getCouponStats);

export default router;
