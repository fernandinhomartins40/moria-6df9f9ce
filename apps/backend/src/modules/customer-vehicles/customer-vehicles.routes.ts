import { Router } from 'express';
import { CustomerVehiclesController } from './customer-vehicles.controller.js';
import { AuthMiddleware } from '@middlewares/auth.middleware.js';

const router = Router();
const vehiclesController = new CustomerVehiclesController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

router.get('/', vehiclesController.getVehicles);
router.get('/:id', vehiclesController.getVehicleById);
router.get('/:id/revisions', vehiclesController.getVehicleWithRevisions);
router.post('/', vehiclesController.createVehicle);
router.put('/:id', vehiclesController.updateVehicle);
router.patch('/:id/mileage', vehiclesController.updateMileage);
router.delete('/:id', vehiclesController.deleteVehicle);

export default router;
