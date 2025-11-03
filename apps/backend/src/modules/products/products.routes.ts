import { Router } from 'express';
import { ProductsController } from './products.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();
const productsController = new ProductsController();

// Public routes
router.get('/', productsController.getProducts);
router.get('/categories/list', productsController.getCategories);
router.get('/slug/:slug', productsController.getProductBySlug);
router.get('/sku/:sku', productsController.getProductBySku);
router.get('/category/:category', productsController.getProductsByCategory);
router.get('/:id', productsController.getProductById);

// Protected routes (admin only)
router.post('/', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), productsController.createProduct);
router.put('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), productsController.updateProduct);
router.delete('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.ADMIN), productsController.deleteProduct);
router.patch('/:id/stock', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), productsController.updateStock);
router.get('/stock/low', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), productsController.getLowStockProducts);

export default router;
