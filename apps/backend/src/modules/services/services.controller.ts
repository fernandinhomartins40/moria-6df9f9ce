import { Request, Response, NextFunction } from 'express';
import { ServicesService } from './services.service.js';
import { createServiceSchema } from './dto/create-service.dto.js';
import { updateServiceSchema } from './dto/update-service.dto.js';
import { queryServicesSchema } from './dto/query-services.dto.js';

export class ServicesController {
  private servicesService: ServicesService;

  constructor() {
    this.servicesService = new ServicesService();
  }

  /**
   * GET /services
   */
  getServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = queryServicesSchema.parse(req.query);
      const result = await this.servicesService.getServices(query);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /services/:id
   */
  getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = await this.servicesService.getServiceById(req.params.id);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /services/slug/:slug
   */
  getServiceBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const service = await this.servicesService.getServiceBySlug(req.params.slug);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /services/category/:category
   */
  getServicesByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const services = await this.servicesService.getServicesByCategory(req.params.category, limit);

      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /services/categories/list
   */
  getCategories = async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    try {
      const categories = await this.servicesService.getCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /services
   */
  createService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createServiceSchema.parse(req.body);
      const service = await this.servicesService.createService(dto);

      res.status(201).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /services/:id
   */
  updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updateServiceSchema.parse(req.body);
      const service = await this.servicesService.updateService(req.params.id, dto);

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /services/:id
   */
  deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.servicesService.deleteService(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
