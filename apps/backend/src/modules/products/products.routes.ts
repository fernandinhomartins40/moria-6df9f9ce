import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const productsController = new ProductsController();

// Public routes
router.get('/', productsController.getProducts);
router.get('/categories/list', productsController.getCategories);
router.get('/slug/:slug', productsController.getProductBySlug);
router.get('/sku/:sku', productsController.getProductBySku);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/:id', productsController.getProductById);

// Protected routes (admin only - you can add role checking middleware here)
router.post('/', AuthMiddleware.authenticate, productsController.createProduct);
router.put('/:id', AuthMiddleware.authenticate, productsController.updateProduct);
router.delete('/:id', AuthMiddleware.authenticate, productsController.deleteProduct);
router.patch('/:id/stock', AuthMiddleware.authenticate, productsController.updateStock);
router.get('/stock/low', AuthMiddleware.authenticate, productsController.getLowStockProducts);

export default router;
