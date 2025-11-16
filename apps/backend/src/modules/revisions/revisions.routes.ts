import { Router } from 'express';
import { RevisionsController } from './revisions.controller.js';
import { AdminAuthMiddleware } from '@middlewares/admin-auth.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();
const revisionsController = new RevisionsController();

// Statistics (all staff can view)
router.get('/statistics', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.getStatistics);

// Vehicle history (all staff can view)
router.get('/vehicle/:vehicleId/history', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.getVehicleHistory);

// Read operations (all staff can view)
router.get('/', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.getRevisions);
router.get('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.getRevisionById);

// Create/Update operations (staff can create and update revisions)
router.post('/', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.createRevision);
router.put('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.updateRevision);

// Partial updates (staff can save partial progress)
router.patch('/:id/checklist', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.updateChecklistPartial);

// Mechanic assignment (staff can assign mechanics)
router.patch('/:id/assign-mechanic', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.assignMechanic);
router.patch('/:id/transfer-mechanic', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), revisionsController.transferMechanic);

// Status changes (staff can manage revision status)
router.patch('/:id/start', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.startRevision);
router.patch('/:id/complete', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.STAFF), revisionsController.completeRevision);
router.patch('/:id/cancel', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.MANAGER), revisionsController.cancelRevision);

// Delete operations (only managers and above)
router.delete('/:id', AdminAuthMiddleware.authenticate, AdminAuthMiddleware.requireMinRole(AdminRole.ADMIN), revisionsController.deleteRevision);

export default router;
