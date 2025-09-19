// src/api/promotionService.ts
import apiClient from './apiClient';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: number[];
  applicableCategories?: string[];
  minimumOrderValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionListResponse {
  promotions: Promotion[];
  totalCount: number;
  page: number;
  limit: number;
}

class PromotionService {
  async getActivePromotions(): Promise<Promotion[]> {
    const response = await apiClient.get<Promotion[]>('/promotions/active');
    return response.data;
  }

  async getPromotions(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<PromotionListResponse> {
    const response = await apiClient.get<PromotionListResponse>('/promotions', { params });
    return response.data;
  }

  async getPromotionById(id: number): Promise<Promotion> {
    const response = await apiClient.get<Promotion>(`/promotions/${id}`);
    return response.data;
  }

  async getApplicablePromotions(orderTotal: number, productIds?: number[]): Promise<Promotion[]> {
    const response = await apiClient.post<Promotion[]>('/promotions/applicable', {
      orderTotal,
      productIds
    });
    return response.data;
  }
}

export default new PromotionService();