import { Router } from 'express';
import { PromotionsController } from './promotions.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const promotionsController = new PromotionsController();

// Public routes
router.get('/active', promotionsController.getActivePromotions);
router.get('/code/:code', promotionsController.getPromotionByCode);

// Protected routes (require authentication)
router.use(AuthMiddleware.authenticate);

// Admin routes (for creating/managing promotions)
router.post('/', promotionsController.createPromotion);
router.get('/', promotionsController.getPromotions);
router.get('/:id', promotionsController.getPromotionById);
router.patch('/:id', promotionsController.updatePromotion);
router.delete('/:id', promotionsController.deletePromotion);

// Promotion actions
router.post('/:id/activate', promotionsController.activatePromotion);
router.post('/:id/deactivate', promotionsController.deactivatePromotion);
router.get('/:id/stats', promotionsController.getPromotionStats);

export default router;
