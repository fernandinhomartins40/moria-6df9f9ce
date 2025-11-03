import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AdminAuthController } from './admin-auth.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';

const router = Router();
const authController = new AuthController();
const adminAuthController = new AdminAuthController();

// Customer public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Customer protected routes
router.get('/profile', AuthMiddleware.authenticate, authController.getProfile);
router.put('/profile', AuthMiddleware.authenticate, authController.updateProfile);

// Admin public routes
router.post('/admin/login', adminAuthController.login);
router.post('/admin/logout', adminAuthController.logout);

// Admin protected routes
router.get('/admin/profile', AdminAuthMiddleware.authenticate, adminAuthController.getProfile);
router.put('/admin/profile', AdminAuthMiddleware.authenticate, adminAuthController.updateProfile);

export default router;
