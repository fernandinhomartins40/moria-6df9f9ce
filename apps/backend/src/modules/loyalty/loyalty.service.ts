import {
  LoyaltySettings,
  LoyaltyReward,
  RedeemedReward,
  PointTransaction,
  PointTransactionType,
  RewardStatus,
  CustomerLevel,
  Prisma,
} from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { PaginationUtil, PaginatedResponse } from '@shared/utils/pagination.util.js';
import { logger } from '@shared/utils/logger.util.js';
import { CreateRewardDto } from './dto/create-reward.dto.js';
import { UpdateRewardDto } from './dto/update-reward.dto.js';
import { UpdateLoyaltySettingsDto } from './dto/update-loyalty-settings.dto.js';
import { ManualPointsDto } from './dto/manual-points.dto.js';

export type RewardWithRedemptions = LoyaltyReward & {
  redemptions: RedeemedReward[];
};

export interface LoyaltyStats {
  totalPoints: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  level: CustomerLevel;
  pointsToNextLevel: number;
  recentTransactions: PointTransaction[];
  availableRewards: number;
}

export interface AdminLoyaltyStats {
  totalCustomersWithPoints: number;
  totalPointsDistributed: number;
  totalPointsRedeemed: number;
  totalActiveRewards: number;
  totalRedemptions: number;
  recentTransactions: PointTransaction[];
}

export class LoyaltyService {
  /**
   * Get or create loyalty settings
   */
  async getSettings(): Promise<LoyaltySettings> {
    let settings = await prisma.loyaltySettings.findFirst();

    if (!settings) {
      settings = await prisma.loyaltySettings.create({
        data: {},
      });
    }

    return settings;
  }

  /**
   * Update loyalty settings
   */
  async updateSettings(dto: UpdateLoyaltySettingsDto): Promise<LoyaltySettings> {
    const settings = await this.getSettings();

    const updated = await prisma.loyaltySettings.update({
      where: { id: settings.id },
      data: dto,
    });

    logger.info(`Loyalty settings updated: ${settings.id}`);

    return updated;
  }

  /**
   * Calculate points for a purchase
   */
  async calculatePointsForPurchase(customerId: string, purchaseAmount: number): Promise<number> {
    const settings = await this.getSettings();

    if (!settings.isActive) {
      return 0;
    }

    if (purchaseAmount < Number(settings.minPurchaseForPoints)) {
      return 0;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Calculate base points
    const basePoints = Math.floor(purchaseAmount * Number(settings.pointsPerReal));

    // Apply level multiplier
    let multiplier = 1.0;
    switch (customer.level) {
      case CustomerLevel.BRONZE:
        multiplier = Number(settings.bronzeMultiplier);
        break;
      case CustomerLevel.SILVER:
        multiplier = Number(settings.silverMultiplier);
        break;
      case CustomerLevel.GOLD:
        multiplier = Number(settings.goldMultiplier);
        break;
      case CustomerLevel.PLATINUM:
        multiplier = Number(settings.platinumMultiplier);
        break;
    }

    return Math.floor(basePoints * multiplier);
  }

  /**
   * Award points to customer
   */
  async awardPoints(
    customerId: string,
    points: number,
    type: PointTransactionType,
    description: string,
    metadata?: {
      orderId?: string;
      rewardId?: string;
      referenceId?: string;
      executedBy?: string;
      expiresAt?: Date;
    }
  ): Promise<PointTransaction> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    // Create transaction
    const transaction = await prisma.pointTransaction.create({
      data: {
        customerId,
        type,
        points,
        description,
        orderId: metadata?.orderId,
        rewardId: metadata?.rewardId,
        referenceId: metadata?.referenceId,
        executedBy: metadata?.executedBy,
        expiresAt: metadata?.expiresAt,
      },
    });

    // Update customer points
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: {
          increment: points,
        },
        totalPointsEarned: {
          increment: points > 0 ? points : 0,
        },
      },
    });

    logger.info(`Awarded ${points} points to customer ${customerId} (${type})`);

    return transaction;
  }

  /**
   * Deduct points from customer
   */
  async deductPoints(
    customerId: string,
    points: number,
    type: PointTransactionType,
    description: string,
    metadata?: {
      orderId?: string;
      rewardId?: string;
      referenceId?: string;
    }
  ): Promise<PointTransaction> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    if (customer.loyaltyPoints < points) {
      throw ApiError.badRequest('Insufficient loyalty points');
    }

    // Create transaction (negative points)
    const transaction = await prisma.pointTransaction.create({
      data: {
        customerId,
        type,
        points: -points,
        description,
        orderId: metadata?.orderId,
        rewardId: metadata?.rewardId,
        referenceId: metadata?.referenceId,
      },
    });

    // Update customer points
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        loyaltyPoints: {
          decrement: points,
        },
        totalPointsRedeemed: {
          increment: points,
        },
      },
    });

    logger.info(`Deducted ${points} points from customer ${customerId} (${type})`);

    return transaction;
  }

  /**
   * Get customer loyalty stats
   */
  async getCustomerStats(customerId: string): Promise<LoyaltyStats> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const recentTransactions = await prisma.pointTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const availableRewards = await prisma.loyaltyReward.count({
      where: {
        status: RewardStatus.ACTIVE,
        pointsCost: { lte: customer.loyaltyPoints },
        OR: [{ minLevel: null }, { minLevel: customer.level }],
      },
    });

    // Calculate points to next level (simplified)
    const pointsToNextLevel = this.calculatePointsToNextLevel(
      customer.level,
      customer.totalPointsEarned
    );

    return {
      totalPoints: customer.loyaltyPoints,
      totalPointsEarned: customer.totalPointsEarned,
      totalPointsRedeemed: customer.totalPointsRedeemed,
      level: customer.level,
      pointsToNextLevel,
      recentTransactions,
      availableRewards,
    };
  }

  /**
   * Calculate points needed for next level
   */
  private calculatePointsToNextLevel(currentLevel: CustomerLevel, totalPoints: number): number {
    const levels = {
      [CustomerLevel.BRONZE]: 0,
      [CustomerLevel.SILVER]: 1000,
      [CustomerLevel.GOLD]: 5000,
      [CustomerLevel.PLATINUM]: 15000,
    };

    switch (currentLevel) {
      case CustomerLevel.BRONZE:
        return Math.max(0, levels[CustomerLevel.SILVER] - totalPoints);
      case CustomerLevel.SILVER:
        return Math.max(0, levels[CustomerLevel.GOLD] - totalPoints);
      case CustomerLevel.GOLD:
        return Math.max(0, levels[CustomerLevel.PLATINUM] - totalPoints);
      case CustomerLevel.PLATINUM:
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Get point transactions with pagination
   */
  async getTransactions(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<PointTransaction>> {
    const { page: validPage, limit: validLimit } = PaginationUtil.validateParams({ page, limit });
    const skip = PaginationUtil.calculateSkip(validPage, validLimit);

    const [transactions, totalCount] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
      }),
      prisma.pointTransaction.count({ where: { customerId } }),
    ]);

    return PaginationUtil.buildResponse(transactions, validPage, validLimit, totalCount);
  }

  // ===== REWARDS MANAGEMENT =====

  /**
   * Create a new reward
   */
  async createReward(dto: CreateRewardDto): Promise<LoyaltyReward> {
    const reward = await prisma.loyaltyReward.create({
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    logger.info(`Reward created: ${reward.id}`);

    return reward;
  }

  /**
   * Update a reward
   */
  async updateReward(rewardId: string, dto: UpdateRewardDto): Promise<LoyaltyReward> {
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw ApiError.notFound('Reward not found');
    }

    const updated = await prisma.loyaltyReward.update({
      where: { id: rewardId },
      data: {
        ...dto,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });

    logger.info(`Reward updated: ${rewardId}`);

    return updated;
  }

  /**
   * Delete a reward
   */
  async deleteReward(rewardId: string): Promise<void> {
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw ApiError.notFound('Reward not found');
    }

    await prisma.loyaltyReward.delete({
      where: { id: rewardId },
    });

    logger.info(`Reward deleted: ${rewardId}`);
  }

  /**
   * Get all rewards with pagination
   */
  async getRewards(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: RewardStatus;
      type?: string;
      minLevel?: CustomerLevel;
    }
  ): Promise<PaginatedResponse<LoyaltyReward>> {
    const { page: validPage, limit: validLimit } = PaginationUtil.validateParams({ page, limit });
    const skip = PaginationUtil.calculateSkip(validPage, validLimit);

    const where: Prisma.LoyaltyRewardWhereInput = {
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type as any }),
      ...(filters?.minLevel && { minLevel: filters.minLevel }),
    };

    const [rewards, totalCount] = await Promise.all([
      prisma.loyaltyReward.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: validLimit,
      }),
      prisma.loyaltyReward.count({ where }),
    ]);

    return PaginationUtil.buildResponse(rewards, validPage, validLimit, totalCount);
  }

  /**
   * Get available rewards for customer
   */
  async getAvailableRewardsForCustomer(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<LoyaltyReward>> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const { page: validPage, limit: validLimit } = PaginationUtil.validateParams({ page, limit });
    const skip = PaginationUtil.calculateSkip(validPage, validLimit);

    const where: Prisma.LoyaltyRewardWhereInput = {
      status: RewardStatus.ACTIVE,
      AND: [
        {
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
        {
          OR: [
            { minLevel: null },
            { minLevel: customer.level },
          ],
        },
      ],
    };

    const [rewards, totalCount] = await Promise.all([
      prisma.loyaltyReward.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { pointsCost: 'asc' }],
        skip,
        take: validLimit,
      }),
      prisma.loyaltyReward.count({ where }),
    ]);

    return PaginationUtil.buildResponse(rewards, validPage, validLimit, totalCount);
  }

  /**
   * Redeem a reward
   */
  async redeemReward(customerId: string, rewardId: string): Promise<RedeemedReward> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
      include: { redemptions: { where: { customerId } } },
    });

    if (!reward) {
      throw ApiError.notFound('Reward not found');
    }

    // Validations
    if (reward.status !== RewardStatus.ACTIVE) {
      throw ApiError.badRequest('Reward is not active');
    }

    if (reward.expiresAt && new Date() > reward.expiresAt) {
      throw ApiError.badRequest('Reward has expired');
    }

    if (customer.loyaltyPoints < reward.pointsCost) {
      throw ApiError.badRequest('Insufficient loyalty points');
    }

    if (reward.minLevel && this.compareLevels(customer.level, reward.minLevel) < 0) {
      throw ApiError.badRequest('Customer level is too low for this reward');
    }

    if (reward.usageLimit && reward.usageCount >= reward.usageLimit) {
      throw ApiError.badRequest('Reward usage limit reached');
    }

    if (reward.limitPerCustomer && reward.redemptions.length >= reward.limitPerCustomer) {
      throw ApiError.badRequest('Customer has reached the limit for this reward');
    }

    // Generate unique redemption code
    const redemptionCode = this.generateRedemptionCode();

    // Calculate expiration (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create redemption
    const redemption = await prisma.redeemedReward.create({
      data: {
        customerId,
        rewardId,
        pointsUsed: reward.pointsCost,
        redemptionCode,
        expiresAt,
        rewardData: JSON.parse(JSON.stringify(reward)),
      },
    });

    // Deduct points
    await this.deductPoints(
      customerId,
      reward.pointsCost,
      PointTransactionType.REDEEM_REWARD,
      `Resgate: ${reward.name}`,
      { rewardId }
    );

    // Update reward usage count
    await prisma.loyaltyReward.update({
      where: { id: rewardId },
      data: {
        usageCount: { increment: 1 },
      },
    });

    logger.info(`Reward redeemed: ${rewardId} by customer ${customerId}`);

    return redemption;
  }

  /**
   * Get redeemed rewards for customer
   */
  async getRedeemedRewards(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<RedeemedReward>> {
    const { page: validPage, limit: validLimit } = PaginationUtil.validateParams({ page, limit });
    const skip = PaginationUtil.calculateSkip(validPage, validLimit);

    const [redemptions, totalCount] = await Promise.all([
      prisma.redeemedReward.findMany({
        where: { customerId },
        include: { reward: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: validLimit,
      }),
      prisma.redeemedReward.count({ where: { customerId } }),
    ]);

    return PaginationUtil.buildResponse(redemptions, validPage, validLimit, totalCount);
  }

  /**
   * Mark redeemed reward as used
   */
  async markRewardAsUsed(redemptionCode: string): Promise<RedeemedReward> {
    const redemption = await prisma.redeemedReward.findUnique({
      where: { redemptionCode },
    });

    if (!redemption) {
      throw ApiError.notFound('Redemption not found');
    }

    if (redemption.isUsed) {
      throw ApiError.badRequest('Reward already used');
    }

    if (redemption.expiresAt && new Date() > redemption.expiresAt) {
      throw ApiError.badRequest('Redemption has expired');
    }

    const updated = await prisma.redeemedReward.update({
      where: { redemptionCode },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    logger.info(`Redemption marked as used: ${redemptionCode}`);

    return updated;
  }

  // ===== ADMIN FUNCTIONS =====

  /**
   * Add/adjust points manually (admin)
   */
  async manualPointsAdjustment(dto: ManualPointsDto, adminId: string): Promise<PointTransaction> {
    if (dto.points === 0) {
      throw ApiError.badRequest('Points cannot be zero');
    }

    if (dto.points > 0) {
      return this.awardPoints(dto.customerId, dto.points, dto.type, dto.description, {
        executedBy: adminId,
      });
    } else {
      return this.deductPoints(dto.customerId, Math.abs(dto.points), dto.type, dto.description, {
        referenceId: adminId,
      });
    }
  }

  /**
   * Get admin loyalty stats
   */
  async getAdminStats(): Promise<AdminLoyaltyStats> {
    const [customersWithPoints, totalPointsEarned, totalPointsRedeemed, activeRewards, totalRedemptions, recentTransactions] = await Promise.all([
      prisma.customer.count({
        where: { loyaltyPoints: { gt: 0 } },
      }),
      prisma.customer.aggregate({
        _sum: { totalPointsEarned: true },
      }),
      prisma.customer.aggregate({
        _sum: { totalPointsRedeemed: true },
      }),
      prisma.loyaltyReward.count({
        where: { status: RewardStatus.ACTIVE },
      }),
      prisma.redeemedReward.count(),
      prisma.pointTransaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      totalCustomersWithPoints: customersWithPoints,
      totalPointsDistributed: totalPointsEarned._sum.totalPointsEarned || 0,
      totalPointsRedeemed: totalPointsRedeemed._sum.totalPointsRedeemed || 0,
      totalActiveRewards: activeRewards,
      totalRedemptions,
      recentTransactions,
    };
  }

  /**
   * Get all customers with points (admin)
   */
  async getCustomersWithPoints(
    page: number = 1,
    limit: number = 20,
    filters?: {
      minPoints?: number;
      level?: CustomerLevel;
    }
  ): Promise<
    PaginatedResponse<{
      id: string;
      name: string;
      email: string;
      loyaltyPoints: number;
      totalPointsEarned: number;
      totalPointsRedeemed: number;
      level: CustomerLevel;
    }>
  > {
    const { page: validPage, limit: validLimit } = PaginationUtil.validateParams({ page, limit });
    const skip = PaginationUtil.calculateSkip(validPage, validLimit);

    const where: Prisma.CustomerWhereInput = {
      ...(filters?.minPoints !== undefined && { loyaltyPoints: { gte: filters.minPoints } }),
      ...(filters?.level && { level: filters.level }),
    };

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          loyaltyPoints: true,
          totalPointsEarned: true,
          totalPointsRedeemed: true,
          level: true,
        },
        orderBy: { loyaltyPoints: 'desc' },
        skip,
        take: validLimit,
      }),
      prisma.customer.count({ where }),
    ]);

    return PaginationUtil.buildResponse(customers, validPage, validLimit, totalCount);
  }

  // ===== HELPER FUNCTIONS =====

  /**
   * Compare customer levels
   */
  private compareLevels(level1: CustomerLevel, level2: CustomerLevel): number {
    const levels = {
      [CustomerLevel.BRONZE]: 0,
      [CustomerLevel.SILVER]: 1,
      [CustomerLevel.GOLD]: 2,
      [CustomerLevel.PLATINUM]: 3,
    };

    return levels[level1] - levels[level2];
  }

  /**
   * Generate unique redemption code
   */
  private generateRedemptionCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
