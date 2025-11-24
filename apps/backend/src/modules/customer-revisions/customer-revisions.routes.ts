import { Router } from 'express';
import { CustomerRevisionsController } from './customer-revisions.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const customerRevisionsController = new CustomerRevisionsController();

// All routes require customer authentication
router.use(AuthMiddleware.authenticate);

// Statistics
router.get('/statistics', customerRevisionsController.getCustomerStatistics);

// Reminders - must come before /:id to avoid route collision
router.get('/reminders/upcoming', customerRevisionsController.getUpcomingReminders);

// Vehicle-specific revisions - must come before /:id
router.get('/vehicle/:vehicleId', customerRevisionsController.getCustomerRevisionsByVehicle);

// Get all revisions for authenticated customer
router.get('/', customerRevisionsController.getCustomerRevisions);

// Get specific revision by ID
router.get('/:id', customerRevisionsController.getCustomerRevisionById);

export default router;
