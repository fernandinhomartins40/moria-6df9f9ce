import { Request, Response, NextFunction } from 'express';
import { RevisionsService } from './revisions.service.js';
import { createRevisionSchema, CreateRevisionDto } from './dto/create-revision.dto.js';
import { updateRevisionSchema } from './dto/update-revision.dto.js';
import { RevisionStatus } from '@prisma/client';
import { ApiError } from '@shared/utils/error.util.js';

export class RevisionsController {
  private revisionsService: RevisionsService;

  constructor() {
    this.revisionsService = new RevisionsService();
  }

  /**
   * GET /revisions
   * Get all revisions (Admin only - removes customer filter)
   */
  getRevisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const filters: any = {};

      // Allow filtering by customer
      if (req.query.customerId) {
        filters.customerId = req.query.customerId as string;
      }

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

      if (req.query.sortBy) {
        filters.sortBy = req.query.sortBy as any;
      }

      if (req.query.sortOrder) {
        filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';
      }

      const result = await this.revisionsService.getAllRevisions(filters);

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
   * Get revision by ID (Admin)
   */
  getRevisionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revision = await this.revisionsService.getRevisionByIdAdmin(req.params.id);

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
   * Create new revision (Admin)
   */
  createRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const dto: CreateRevisionDto = createRevisionSchema.parse(req.body);
      const revision = await this.revisionsService.createRevision(
        dto.customerId,
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
   * Update revision (Admin)
   */
  updateRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const dto = updateRevisionSchema.parse(req.body);
      const revision = await this.revisionsService.updateRevisionAdmin(
        req.params.id,
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
   * Delete revision (Admin)
   */
  deleteRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      await this.revisionsService.deleteRevisionAdmin(req.params.id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /revisions/:id/start
   * Start revision (Admin)
   */
  startRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revision = await this.revisionsService.startRevisionAdmin(req.params.id);

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
   * Complete revision (Admin)
   */
  completeRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revision = await this.revisionsService.completeRevisionAdmin(req.params.id);

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
   * Cancel revision (Admin)
   */
  cancelRevision = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revision = await this.revisionsService.cancelRevisionAdmin(req.params.id);

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
   * Get revision statistics (Admin - all customers)
   */
  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const statistics = await this.revisionsService.getAllRevisionStatistics();

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
   * Get revision history for a vehicle (Admin)
   */
  getVehicleHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const revisions = await this.revisionsService.getVehicleRevisionHistoryAdmin(
        req.params.vehicleId
      );

      res.status(200).json({
        success: true,
        data: revisions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /revisions/:id/checklist
   * Update revision checklist partially (Admin)
   */
  updateChecklistPartial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const { checklistItems } = req.body;

      if (!Array.isArray(checklistItems)) {
        throw ApiError.badRequest('checklistItems must be an array');
      }

      const revision = await this.revisionsService.updateRevisionChecklistPartial(
        req.params.id,
        checklistItems
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
   * PATCH /revisions/:id/assign-mechanic
   * Assign mechanic to revision (Admin)
   */
  assignMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const { mechanicName } = req.body;

      if (!mechanicName || typeof mechanicName !== 'string') {
        throw ApiError.badRequest('mechanicName is required');
      }

      const assignedBy = req.admin.name || req.admin.email;

      const revision = await this.revisionsService.assignMechanicToRevision(
        req.params.id,
        mechanicName,
        assignedBy
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
   * PATCH /revisions/:id/transfer-mechanic
   * Transfer revision to another mechanic (Admin)
   */
  transferMechanic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        throw new Error('Admin not authenticated');
      }

      const { mechanicName, notes } = req.body;

      if (!mechanicName || typeof mechanicName !== 'string') {
        throw ApiError.badRequest('mechanicName is required');
      }

      const transferredBy = req.admin.name || req.admin.email;

      const revision = await this.revisionsService.transferRevisionToMechanic(
        req.params.id,
        mechanicName,
        transferredBy,
        notes
      );

      res.status(200).json({
        success: true,
        data: revision,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== CUSTOMER ROUTES ====================

  /**
   * GET /customer-revisions
   * Get all revisions for authenticated customer
   */
  getCustomerRevisions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const filters = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        vehicleId: req.query.vehicleId as string,
        status: req.query.status as any,
      };

      const result = await this.revisionsService.getRevisions(req.user.customerId, filters);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /customer-revisions/:id
   * Get specific revision for authenticated customer
   */
  getCustomerRevisionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
   * GET /customer-revisions/vehicle/:vehicleId
   * Get revisions for specific vehicle of authenticated customer
   */
  getCustomerRevisionsByVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const result = await this.revisionsService.getRevisions(req.user.customerId, {
        vehicleId: req.params.vehicleId,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /customer-revisions/reminders/upcoming
   * Get upcoming maintenance reminders for authenticated customer
   */
  getUpcomingReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new Error('User not authenticated');
      }

      const reminders = await this.revisionsService.getUpcomingReminders(req.user.customerId);

      res.status(200).json({
        success: true,
        data: reminders,
      });
    } catch (error) {
      next(error);
    }
  };
}
