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

  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, phone, cpf } = req.body;

      if (!name || !email || !phone) {
        res.status(400).json({ error: 'Nome, email e telefone são obrigatórios' });
        return;
      }

      const customer = await this.adminService.createCustomer({
        name,
        email,
        phone,
        cpf
      });

      res.status(201).json(customer);
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

  createVehicleForCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { customerId } = req.params;
      const { brand, model, year, plate, color, mileage, chassisNumber } = req.body;

      if (!brand || !model || !year || !plate || !color) {
        res.status(400).json({ error: 'Marca, modelo, ano, placa e cor são obrigatórios' });
        return;
      }

      const vehicle = await this.adminService.createVehicleForCustomer(customerId, {
        brand,
        model,
        year: Number(year),
        plate,
        color,
        mileage: mileage ? Number(mileage) : undefined,
        chassisNumber
      });

      res.status(201).json(vehicle);
    } catch (error) {
      next(error);
    }
  };

  // ==================== QUOTES (ORÇAMENTOS) ====================

  getQuotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const result = await this.adminService.getQuotes({
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

  getQuoteById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const quote = await this.adminService.getQuoteById(id);
      res.json(quote);
    } catch (error) {
      next(error);
    }
  };

  updateQuotePrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { items } = req.body;
      const order = await this.adminService.updateQuotePrices(id, items);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  approveQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.adminService.approveQuote(id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  rejectQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const order = await this.adminService.rejectQuote(id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };

  updateQuoteStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await this.adminService.updateQuoteStatus(id, status);
      res.json(order);
    } catch (error) {
      next(error);
    }
  };
}
