import { Request, Response, NextFunction } from 'express';
import { VehicleLookupService } from './vehicle-lookup.service.js';
import { lookupVehicleSchema } from './dto/lookup-vehicle.dto.js';
import { ZodError } from 'zod';

export class VehicleLookupController {
  private lookupService: VehicleLookupService;

  constructor() {
    this.lookupService = new VehicleLookupService();
  }

  /**
   * GET /api/vehicles/lookup/:plate
   * Busca dados do veículo por placa
   */
  lookupByPlate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { plate } = req.params;

      // Validar placa
      const validated = lookupVehicleSchema.parse({ plate });

      // Buscar dados
      const result = await this.lookupService.lookupByPlate(validated.plate);

      res.status(200).json({
        success: true,
        data: result.data,
        cached: result.cached,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validação falhou',
          details: error.errors[0]?.message || 'Formato de placa inválido',
        });
        return;
      }
      next(error);
    }
  };

  /**
   * GET /api/vehicles/lookup/status
   * Verifica status dos providers de API
   */
  getProvidersStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = await this.lookupService.getProvidersStatus();

      res.status(200).json({
        success: true,
        data: {
          providers: status,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/vehicles/lookup/cache/stats
   * Retorna estatísticas do cache (admin apenas)
   */
  getCacheStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.lookupService.getCacheStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/vehicles/lookup/cache/clear
   * Limpa o cache (admin apenas)
   */
  clearCache = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      this.lookupService.clearCache();

      res.status(200).json({
        success: true,
        message: 'Cache limpo com sucesso',
      });
    } catch (error) {
      next(error);
    }
  };
}
