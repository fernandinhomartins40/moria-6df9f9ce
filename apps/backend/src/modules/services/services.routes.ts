import { Router } from 'express';
import { ServicesController } from './services.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();
const servicesController = new ServicesController();

// Public routes
router.get('/', servicesController.getServices);
router.get('/categories/list', servicesController.getCategories);
router.get('/slug/:slug', servicesController.getServiceBySlug);
router.get('/category/:category', servicesController.getServicesByCategory);
router.get('/:id', servicesController.getServiceById);

// Protected routes (admin only)
router.post('/', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), servicesController.createService);
router.put('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), servicesController.updateService);
router.delete('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.ADMIN), servicesController.deleteService);

export default router;
