import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './loyalty.service.js';
import { CreateRewardDtoSchema } from './dto/create-reward.dto.js';
import { UpdateRewardDtoSchema } from './dto/update-reward.dto.js';
import { UpdateLoyaltySettingsDtoSchema } from './dto/update-loyalty-settings.dto.js';
import { ManualPointsDtoSchema } from './dto/manual-points.dto.js';
import { RewardStatus, CustomerLevel } from '@prisma/client';

export class LoyaltyAdminController {
  private loyaltyService: LoyaltyService;

  constructor() {
    this.loyaltyService = new LoyaltyService();
  }

  /**
   * Get loyalty program settings
   * GET /api/admin/loyalty/settings
   */
  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.loyaltyService.getSettings();

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update loyalty program settings
   * PUT /api/admin/loyalty/settings
   */
  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = UpdateLoyaltySettingsDtoSchema.parse(req.body);

      const settings = await this.loyaltyService.updateSettings(dto);

      res.json({
        success: true,
        data: settings,
        message: 'Loyalty settings updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get admin loyalty stats
   * GET /api/admin/loyalty/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.loyaltyService.getAdminStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  // ===== REWARDS MANAGEMENT =====

  /**
   * Get all rewards
   * GET /api/admin/loyalty/rewards
   */
  getRewards = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as RewardStatus | undefined;
      const type = req.query.type as string | undefined;
      const minLevel = req.query.minLevel as CustomerLevel | undefined;

      const rewards = await this.loyaltyService.getRewards(page, limit, {
        status,
        type,
        minLevel,
      });

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a reward
   * POST /api/admin/loyalty/rewards
   */
  createReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = CreateRewardDtoSchema.parse(req.body);

      const reward = await this.loyaltyService.createReward(dto);

      res.status(201).json({
        success: true,
        data: reward,
        message: 'Reward created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a reward
   * PUT /api/admin/loyalty/rewards/:id
   */
  updateReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const dto = UpdateRewardDtoSchema.parse(req.body);

      const reward = await this.loyaltyService.updateReward(id, dto);

      res.json({
        success: true,
        data: reward,
        message: 'Reward updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a reward
   * DELETE /api/admin/loyalty/rewards/:id
   */
  deleteReward = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      await this.loyaltyService.deleteReward(id);

      res.json({
        success: true,
        message: 'Reward deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ===== CUSTOMERS MANAGEMENT =====

  /**
   * Get customers with points
   * GET /api/admin/loyalty/customers
   */
  getCustomersWithPoints = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const minPoints = req.query.minPoints
        ? parseInt(req.query.minPoints as string)
        : undefined;
      const level = req.query.level as CustomerLevel | undefined;

      const customers = await this.loyaltyService.getCustomersWithPoints(page, limit, {
        minPoints,
        level,
      });

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer loyalty stats
   * GET /api/admin/loyalty/customers/:id/stats
   */
  getCustomerStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const stats = await this.loyaltyService.getCustomerStats(id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer point transactions
   * GET /api/admin/loyalty/customers/:id/transactions
   */
  getCustomerTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const transactions = await this.loyaltyService.getTransactions(id, page, limit);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Manual points adjustment
   * POST /api/admin/loyalty/points/adjust
   */
  adjustPoints = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.admin!.adminId;
      const dto = ManualPointsDtoSchema.parse(req.body);

      const transaction = await this.loyaltyService.manualPointsAdjustment(dto, adminId);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Points adjusted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark redeemed reward as used
   * POST /api/admin/loyalty/redemptions/:code/use
   */
  markRewardAsUsed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.params;

      const redemption = await this.loyaltyService.markRewardAsUsed(code);

      res.json({
        success: true,
        data: redemption,
        message: 'Reward marked as used',
      });
    } catch (error) {
      next(error);
    }
  };
}
