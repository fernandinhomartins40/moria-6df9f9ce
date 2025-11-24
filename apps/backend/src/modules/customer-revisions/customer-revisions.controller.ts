import { Request, Response } from 'express';
import { CustomerRevisionsService } from './customer-revisions.service.js';
import { AuthRequest } from '@middlewares/auth.middleware.js';

export class CustomerRevisionsController {
  private customerRevisionsService: CustomerRevisionsService;

  constructor() {
    this.customerRevisionsService = new CustomerRevisionsService();
  }

  /**
   * Get all revisions for authenticated customer
   * GET /customer-revisions
   */
  getCustomerRevisions = async (req: AuthRequest, res: Response): Promise<void> => {
    const customerId = req.customer?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        error: 'Customer not authenticated'
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const vehicleId = req.query.vehicleId as string | undefined;
    const status = req.query.status as string | undefined;

    const result = await this.customerRevisionsService.getCustomerRevisions(
      customerId,
      { page, limit, vehicleId, status }
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: result.meta
    });
  };

  /**
   * Get specific revision by ID for authenticated customer
   * GET /customer-revisions/:id
   */
  getCustomerRevisionById = async (req: AuthRequest, res: Response): Promise<void> => {
    const customerId = req.customer?.id;
    const revisionId = req.params.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        error: 'Customer not authenticated'
      });
      return;
    }

    const revision = await this.customerRevisionsService.getCustomerRevisionById(
      customerId,
      revisionId
    );

    res.status(200).json({
      success: true,
      data: revision
    });
  };

  /**
   * Get revisions for specific vehicle of authenticated customer
   * GET /customer-revisions/vehicle/:vehicleId
   */
  getCustomerRevisionsByVehicle = async (req: AuthRequest, res: Response): Promise<void> => {
    const customerId = req.customer?.id;
    const vehicleId = req.params.vehicleId;

    if (!customerId) {
      res.status(401).json({
        success: false,
        error: 'Customer not authenticated'
      });
      return;
    }

    const revisions = await this.customerRevisionsService.getCustomerRevisionsByVehicle(
      customerId,
      vehicleId
    );

    res.status(200).json({
      success: true,
      data: revisions
    });
  };

  /**
   * Get upcoming maintenance reminders for authenticated customer
   * GET /customer-revisions/reminders/upcoming
   */
  getUpcomingReminders = async (req: AuthRequest, res: Response): Promise<void> => {
    const customerId = req.customer?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        error: 'Customer not authenticated'
      });
      return;
    }

    const reminders = await this.customerRevisionsService.getUpcomingReminders(customerId);

    res.status(200).json({
      success: true,
      data: reminders
    });
  };

  /**
   * Get revision statistics for authenticated customer
   * GET /customer-revisions/statistics
   */
  getCustomerStatistics = async (req: AuthRequest, res: Response): Promise<void> => {
    const customerId = req.customer?.id;

    if (!customerId) {
      res.status(401).json({
        success: false,
        error: 'Customer not authenticated'
      });
      return;
    }

    const statistics = await this.customerRevisionsService.getCustomerStatistics(customerId);

    res.status(200).json({
      success: true,
      data: statistics
    });
  };
}
