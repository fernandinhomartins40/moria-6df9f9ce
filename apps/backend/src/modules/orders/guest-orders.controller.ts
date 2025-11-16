import { Request, Response, NextFunction } from 'express';
import { GuestOrdersService } from './guest-orders.service.js';
import { createGuestOrderSchema } from './dto/create-guest-order.dto.js';

export class GuestOrdersController {
  private guestOrdersService: GuestOrdersService;

  constructor() {
    this.guestOrdersService = new GuestOrdersService();
  }

  /**
   * POST /orders/guest
   * Create order for guest user (without authentication)
   */
  createGuestOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createGuestOrderSchema.parse(req.body);
      const result = await this.guestOrdersService.createGuestOrder(dto);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
