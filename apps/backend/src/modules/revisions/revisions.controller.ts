import { Request, Response, NextFunction } from 'express';
import { RevisionsService } from './revisions.service.js';
import { createRevisionSchema } from './dto/create-revision.dto.js';
import { updateRevisionSchema } from './dto/update-revision.dto.js';
import { RevisionStatus } from '@prisma/client';

export class RevisionsController {
  private revisionsService: RevisionsService;

  constructor() {
    this.revisionsService = new RevisionsService();
  }

  /**
   * GET /revisions
   * Get all revisions for authenticated customer
   */
  getRevisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const filters: any = {};

      if (req.query.vehicleId) {
        filters.vehicleId = req.query.vehicleId as string;
      }

      if (req.query.status) {
        filters.status = req.query.status as RevisionStatus;
      }

      if (req.query.dateFrom) {
        filters.dateFrom = new Date(req.query.dateFrom as string);
      }

      if (req.query.dateTo) {
        filters.dateTo = new Date(req.query.dateTo as string);
      }

      if (req.query.page) {
        filters.page = parseInt(req.query.page as string, 10);
      }

      if (req.query.limit) {
        filters.limit = parseInt(req.query.limit as string, 10);
      }

      const result = await this.revisionsService.getRevisions(
        req.user.customerId,
        filters
      );

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
   * GET /revisions/:id
   * Get revision by ID
   */
  getRevisionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const revision = await this.revisionsService.getRevisionById(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /revisions
   * Create new revision
   */
  createRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const dto = createRevisionSchema.parse(req.body);
      const revision = await this.revisionsService.createRevision(
        req.user.customerId,
        dto
      );

      res.status(201).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /revisions/:id
   * Update revision
   */
  updateRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const dto = updateRevisionSchema.parse(req.body);
      const revision = await this.revisionsService.updateRevision(
        req.params.id,
        req.user.customerId,
        dto
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /revisions/:id
   * Delete revision
   */
  deleteRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      await this.revisionsService.deleteRevision(req.params.id, req.user.customerId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /revisions/:id/start
   * Start revision
   */
  startRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const revision = await this.revisionsService.startRevision(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /revisions/:id/complete
   * Complete revision
   */
  completeRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const revision = await this.revisionsService.completeRevision(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /revisions/:id/cancel
   * Cancel revision
   */
  cancelRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const revision = await this.revisionsService.cancelRevision(
        req.params.id,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /revisions/statistics
   * Get revision statistics
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const statistics = await this.revisionsService.getRevisionStatistics(
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /revisions/vehicle/:vehicleId/history
   * Get revision history for a vehicle
   */
  getVehicleHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const revisions = await this.revisionsService.getVehicleRevisionHistory(
        req.params.vehicleId,
        req.user.customerId
      );

      res.status(200).json({
        success: true,
        data: revisions,
      });
    } catch (error) {
      next(error);
    }
  };
}
