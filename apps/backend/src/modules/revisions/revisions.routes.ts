import { Router } from 'express';
import { RevisionsController } from './revisions.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const revisionsController = new RevisionsController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// Statistics
router.get('/statistics', revisionsController.getStatistics);

// Vehicle history
router.get('/vehicle/:vehicleId/history', revisionsController.getVehicleHistory);

// CRUD operations
router.get('/', revisionsController.getRevisions);
router.get('/:id', revisionsController.getRevisionById);
router.post('/', revisionsController.createRevision);
router.put('/:id', revisionsController.updateRevision);
router.delete('/:id', revisionsController.deleteRevision);

// Status changes
router.patch('/:id/start', revisionsController.startRevision);
router.patch('/:id/complete', revisionsController.completeRevision);
router.patch('/:id/cancel', revisionsController.cancelRevision);

export default router;
