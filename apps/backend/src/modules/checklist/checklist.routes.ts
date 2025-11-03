import { Router } from 'express';
import { ChecklistController } from './checklist.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const checklistController = new ChecklistController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Public endpoints (all authenticated users can access)
router.get('/structure', checklistController.getChecklistStructure);
router.get('/categories/enabled', checklistController.getEnabledCategories);

// Categories management
router.get('/categories', checklistController.getCategories);
router.get('/categories/:id', checklistController.getCategoryById);
router.post('/categories', checklistController.createCategory);
router.put('/categories/:id', checklistController.updateCategory);
router.delete('/categories/:id', checklistController.deleteCategory);
router.put('/categories/reorder', checklistController.updateCategoriesOrder);

// Items management
router.get('/items', checklistController.getItems);
router.get('/items/:id', checklistController.getItemById);
router.get('/categories/:categoryId/items', checklistController.getItemsByCategory);
router.post('/items', checklistController.createItem);
router.put('/items/:id', checklistController.updateItem);
router.delete('/items/:id', checklistController.deleteItem);
router.put('/items/reorder', checklistController.updateItemsOrder);

export default router;
