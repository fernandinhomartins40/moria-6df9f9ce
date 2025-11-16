import { Router } from 'express';
import { RevisionsController } from './revisions.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const revisionsController = new RevisionsController();

// All routes require customer authentication
router.use(AuthMiddleware.authenticate);

// Customer can view their own revisions
router.get('/', revisionsController.getCustomerRevisions);
router.get('/:id', revisionsController.getCustomerRevisionById);

// Get revisions by vehicle
router.get('/vehicle/:vehicleId', revisionsController.getCustomerRevisionsByVehicle);

// Get upcoming maintenance reminders
router.get('/reminders/upcoming', revisionsController.getUpcomingReminders);

export default router;
