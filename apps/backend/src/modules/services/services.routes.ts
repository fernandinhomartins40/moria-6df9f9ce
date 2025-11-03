import { Router } from 'express';
import { ServicesController } from './services.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const servicesController = new ServicesController();

// Public routes
router.get('/', servicesController.getServices);
router.get('/categories/list', servicesController.getCategories);
router.get('/slug/:slug', servicesController.getServiceBySlug);
router.get('/category/:category', servicesController.getServicesByCategory);
router.get('/:id', servicesController.getServiceById);

// Protected routes (admin only)
router.post('/', AuthMiddleware.authenticate, servicesController.createService);
router.put('/:id', AuthMiddleware.authenticate, servicesController.updateService);
router.delete('/:id', AuthMiddleware.authenticate, servicesController.deleteService);

export default router;
