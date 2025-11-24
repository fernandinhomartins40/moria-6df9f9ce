import { Request, Response, NextFunction } from 'express';
import { CustomerVehiclesService } from './customer-vehicles.service.js';
import { createVehicleSchema } from './dto/create-vehicle.dto.js';
import { updateVehicleSchema } from './dto/update-vehicle.dto.js';
import { z } from 'zod';

export class CustomerVehiclesController {
  private vehiclesService: CustomerVehiclesService;

  constructor() {
    this.vehiclesService = new CustomerVehiclesService();
  }

  /**
   * GET /customer-vehicles
   * Get all vehicles for authenticated customer
   */
  getVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicles = await this.vehiclesService.getVehicles(req.user.customerId);

      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /customer-vehicles/archived
   * Get all archived vehicles for authenticated customer
   */
  getArchivedVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicles = await this.vehiclesService.getArchivedVehicles(req.user.customerId);

      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /customer-vehicles/:id
   * Get vehicle by ID
   */
  getVehicleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicle = await this.vehiclesService.getVehicleById(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /customer-vehicles/:id/revisions
   * Get vehicle with revisions history
   */
  getVehicleWithRevisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicle = await this.vehiclesService.getVehicleWithRevisions(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /customer-vehicles
   * Create new vehicle
   */
  createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const dto = createVehicleSchema.parse(req.body);
      const vehicle = await this.vehiclesService.createVehicle(
        req.user.customerId,
        dto
      );

      res.status(201).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /customer-vehicles/:id
   * Update vehicle
   */
  updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const dto = updateVehicleSchema.parse(req.body);
      const vehicle = await this.vehiclesService.updateVehicle(
        req.params.id,
        req.user.customerId,
        dto
      );

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /customer-vehicles/:id/mileage
   * Update vehicle mileage
   */
  updateMileage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const mileageSchema = z.object({
        mileage: z.number().int().min(0),
      });

      const { mileage } = mileageSchema.parse(req.body);
      const vehicle = await this.vehiclesService.updateMileage(
        req.params.id,
        req.user.customerId,
        mileage
      );

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /customer-vehicles/:id
   * Soft delete vehicle (archive)
   */
  deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.vehiclesService.deleteVehicle(req.params.id, req.user.customerId);

      res.status(200).json({
        success: true,
        message: 'Vehicle archived successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /customer-vehicles/:id/restore
   * Restore archived vehicle
   */
  restoreVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const vehicle = await this.vehiclesService.restoreVehicle(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: vehicle,
        message: 'Vehicle restored successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /customer-vehicles/:id/permanent
   * Permanently delete vehicle
   */
  hardDeleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.vehiclesService.hardDeleteVehicle(req.params.id, req.user.customerId);

      res.status(200).json({
        success: true,
        message: 'Vehicle permanently deleted',
      });
    } catch (error) {
      next(error);
    }
  };
}
