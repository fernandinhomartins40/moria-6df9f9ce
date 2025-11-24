import { Router } from 'express';
import { VehicleLookupController } from './vehicle-lookup.controller.js';
import { AuthMiddleware } from '../../middlewares/auth.middleware.js';
import { AdminAuthMiddleware } from '../../middlewares/admin-auth.middleware.js';

const router = Router();
const controller = new VehicleLookupController();

/**
 * @route GET /api/vehicles/lookup/:plate
 * @desc Busca dados do veículo por placa
 * @access Private (requer autenticação)
 */
router.get('/:plate', AuthMiddleware.authenticate, controller.lookupByPlate);

/**
 * @route GET /api/vehicles/lookup-status
 * @desc Verifica status dos providers de API
 * @access Public
 */
router.get('/lookup-status', controller.getProvidersStatus);

/**
 * @route GET /api/vehicles/lookup-cache/stats
 * @desc Retorna estatísticas do cache
 * @access Private (admin apenas)
 */
router.get('/lookup-cache/stats', AdminAuthMiddleware.authenticate, controller.getCacheStats);

/**
 * @route POST /api/vehicles/lookup-cache/clear
 * @desc Limpa o cache
 * @access Private (admin apenas)
 */
router.post('/lookup-cache/clear', AdminAuthMiddleware.authenticate, controller.clearCache);

export default router;
