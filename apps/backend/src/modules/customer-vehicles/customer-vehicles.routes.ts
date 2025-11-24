import { Router } from 'express';
import { CustomerVehiclesController } from './customer-vehicles.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const vehiclesController = new CustomerVehiclesController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

// List routes (must come before :id routes)
router.get('/archived', vehiclesController.getArchivedVehicles);
router.get('/', vehiclesController.getVehicles);

// Create
router.post('/', vehiclesController.createVehicle);

// Specific vehicle routes
router.get('/:id', vehiclesController.getVehicleById);
router.get('/:id/revisions', vehiclesController.getVehicleWithRevisions);
router.put('/:id', vehiclesController.updateVehicle);
router.patch('/:id/mileage', vehiclesController.updateMileage);

// Soft delete, restore, and hard delete
router.delete('/:id', vehiclesController.deleteVehicle);
router.post('/:id/restore', vehiclesController.restoreVehicle);
router.delete('/:id/permanent', vehiclesController.hardDeleteVehicle);

export default router;
