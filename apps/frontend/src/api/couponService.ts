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
  coupons: Coupon[];
  totalCount: number;
  page: number;
  limit: number;
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
}

export default new CouponService();