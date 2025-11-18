import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ==================== DASHBOARD ====================

  getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  // ==================== ORDERS ====================

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const result = await this.adminService.getOrders({
        page: Number(page),
        limit: Number(limit),
        status: status as string,
        search: search as string
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.adminService.getOrderById(id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.adminService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  // ==================== CUSTOMERS ====================

  getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, search, level, status } = req.query;
      const result = await this.adminService.getCustomers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        level: level as string,
        status: status as string
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customer = await this.adminService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  updateCustomerLevel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { level } = req.body;
      const customer = await this.adminService.updateCustomerLevel(id, level);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  updateCustomerStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const customer = await this.adminService.updateCustomerStatus(id, status);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  };

  // ==================== CUSTOMER VEHICLES ====================

  getCustomerVehicles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const vehicles = await this.adminService.getCustomerVehicles(customerId);
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  };
}
