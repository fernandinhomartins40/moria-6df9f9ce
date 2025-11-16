import { Request, Response, NextFunction } from 'express';
import { LoyaltyService } from './loyalty.service.js';
import { AuthRequest } from '@shared/types/request.types.js';
import { RedeemRewardDtoSchema } from './dto/redeem-reward.dto.js';

export class LoyaltyController {
  private loyaltyService: LoyaltyService;

  constructor() {
    this.loyaltyService = new LoyaltyService();
  }

  /**
   * Get customer loyalty stats
   * GET /api/loyalty/stats
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.customerId;

      const stats = await this.loyaltyService.getCustomerStats(customerId);

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
   * GET /api/loyalty/transactions
   */
  getTransactions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.customerId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const transactions = await this.loyaltyService.getTransactions(customerId, page, limit);

      res.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get available rewards for customer
   * GET /api/loyalty/rewards
   */
  getAvailableRewards = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerId = req.user!.customerId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const rewards = await this.loyaltyService.getAvailableRewardsForCustomer(
        customerId,
        page,
        limit
      );

      res.json({
        success: true,
        data: rewards,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Redeem a reward
   * POST /api/loyalty/redeem
   */
  redeemReward = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customerId = req.user!.customerId;
      const dto = RedeemRewardDtoSchema.parse(req.body);

      const redemption = await this.loyaltyService.redeemReward(customerId, dto.rewardId);

      res.status(201).json({
        success: true,
        data: redemption,
        message: 'Reward redeemed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer redeemed rewards
   * GET /api/loyalty/redeemed
   */
  getRedeemedRewards = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const customerId = req.user!.customerId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const redemptions = await this.loyaltyService.getRedeemedRewards(customerId, page, limit);

      res.json({
        success: true,
        data: redemptions,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get loyalty program settings
   * GET /api/loyalty/settings
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
}
