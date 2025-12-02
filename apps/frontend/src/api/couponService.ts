// src/api/couponService.ts
import apiClient from './apiClient';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minValue?: number;
  maxValue?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponListResponse {
  data: Coupon[];
  meta: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  error?: string;
}

class CouponService {
  async getCoupons(params?: {
    page?: number;
    limit?: number;
    active?: boolean;
  }): Promise<CouponListResponse> {
    const response = await apiClient.get<CouponListResponse>('/coupons', { params });
    return response.data;
  }

  async getCouponById(id: string): Promise<Coupon> {
    const response = await apiClient.get<Coupon>(`/coupons/${id}`);
    return response.data;
  }

  async getCouponByCode(code: string): Promise<Coupon> {
    const response = await apiClient.get<Coupon>(`/coupons/code/${code}`);
    return response.data;
  }

  async validateCoupon(code: string, orderTotal: number): Promise<CouponValidationResponse> {
    const response = await apiClient.post<CouponValidationResponse>('/coupons/validate', {
      code,
      orderTotal
    });
    return response.data;
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    const response = await apiClient.get<Coupon[]>('/coupons/active');
    return response.data;
  }

  async applyCoupon(code: string, orderId: string): Promise<{ success: boolean; discountAmount: number }> {
    const response = await apiClient.post<{ success: boolean; discountAmount: number }>('/coupons/apply', {
      code,
      orderId
    });
    return response.data;
  }

  async getActiveCouponCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>('/coupons/active/count');
    return response.data.count;
  }

  // Admin CRUD operations
  async createCoupon(data: Partial<Coupon>): Promise<{ data: Coupon }> {
    const response = await apiClient.post<{ success: boolean; data: Coupon }>('/coupons', data);
    return { data: response.data.data };
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<{ data: Coupon }> {
    const response = await apiClient.patch<{ success: boolean; data: Coupon }>(`/coupons/${id}`, data);
    return { data: response.data.data };
  }

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/coupons/${id}`);
  }

  async toggleCouponStatus(id: string, isActive: boolean): Promise<{ data: Coupon }> {
    // Usa o endpoint de update com apenas o campo isActive
    const response = await apiClient.patch<{ success: boolean; data: Coupon }>(`/coupons/${id}`, { isActive: !isActive });
    return { data: response.data.data };
  }
}

export default new CouponService();