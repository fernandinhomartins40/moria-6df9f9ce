import { Router } from 'express';
import { ShippingController } from './shipping.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';

const router = Router();
const controller = new ShippingController();

// Public routes (for customers to view active methods)
router.get('/methods', controller.getAllMethods);
router.get('/methods/:id', controller.getMethodById);

// Admin only routes
router.post('/methods', AdminAuthMiddleware.authenticate, controller.createMethod);
router.put('/methods/:id', AdminAuthMiddleware.authenticate, controller.updateMethod);
router.delete('/methods/:id', AdminAuthMiddleware.authenticate, controller.deleteMethod);
router.patch('/methods/:id/toggle', AdminAuthMiddleware.authenticate, controller.toggleActive);
router.post('/methods/reorder', AdminAuthMiddleware.authenticate, controller.reorderMethods);
router.post('/methods/seed', AdminAuthMiddleware.authenticate, controller.seedDefaultMethods);

export default router;
