import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', AuthMiddleware.authenticate, authController.getProfile);
router.put('/profile', AuthMiddleware.authenticate, authController.updateProfile);

export default router;
