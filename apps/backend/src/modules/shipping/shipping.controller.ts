import { Request, Response, NextFunction } from 'express';
import { ShippingService } from './shipping.service.js';

export class ShippingController {
  private shippingService: ShippingService;

  constructor() {
    this.shippingService = new ShippingService();
  }

  /**
   * Get all shipping methods
   * GET /api/shipping/methods
   */
  getAllMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { activeOnly } = req.query;
      const methods = await this.shippingService.getAllMethods(activeOnly === 'true');
      res.status(200).json({ success: true, data: methods });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get shipping method by ID
   * GET /api/shipping/methods/:id
   */
  getMethodById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const method = await this.shippingService.getMethodById(id);
      res.status(200).json({ success: true, data: method });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create shipping method
   * POST /api/shipping/methods
   */
  createMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const method = await this.shippingService.createMethod(req.body);
      res.status(201).json({ success: true, data: method });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update shipping method
   * PUT /api/shipping/methods/:id
   */
  updateMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const method = await this.shippingService.updateMethod(id, req.body);
      res.status(200).json({ success: true, data: method });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete shipping method
   * DELETE /api/shipping/methods/:id
   */
  deleteMethod = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.shippingService.deleteMethod(id);
      res.status(200).json({ success: true, message: 'Shipping method deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Toggle active status
   * PATCH /api/shipping/methods/:id/toggle
   */
  toggleActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const method = await this.shippingService.toggleActive(id);
      res.status(200).json({ success: true, data: method });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reorder shipping methods
   * POST /api/shipping/methods/reorder
   */
  reorderMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { orderedIds } = req.body;
      const methods = await this.shippingService.reorderMethods(orderedIds);
      res.status(200).json({ success: true, data: methods });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Seed default shipping methods
   * POST /api/shipping/methods/seed
   */
  seedDefaultMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.shippingService.seedDefaultMethods();
      res.status(200).json({ success: true, message: 'Default shipping methods seeded successfully' });
    } catch (error) {
      next(error);
    }
  };
}
