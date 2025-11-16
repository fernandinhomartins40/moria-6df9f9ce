import { Router } from 'express';
import { LandingController } from './landing.controller.js';

const router = Router();
const controller = new LandingController();

// Services
router.get('/services', controller.getServices);

// Products
router.get('/products', controller.getProducts);
router.get('/products/categories', controller.getProductCategories);

// Promotions
router.get('/promotions', controller.getPromotions);
router.get('/promotions/products', controller.getPromotionalProducts);

export default router;
