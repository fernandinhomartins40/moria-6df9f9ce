import { Request, Response } from 'express';
import { LandingService } from './landing.service.js';

export class LandingController {
  private service: LandingService;

  constructor() {
    this.service = new LandingService();
  }

  getServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getServices();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.query.category as string | undefined;
      const data = await this.service.getProducts(category);
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getProductCategories = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getProductCategories();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getPromotions = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getPromotions();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getPromotionalProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.service.getPromotionalProducts();
      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}
