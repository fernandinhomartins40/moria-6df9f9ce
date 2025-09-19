// src/hooks/usePromotions.ts
import { useState, useEffect } from 'react';
import { promotionService, handleApiError } from '@/api';
import { Promotion } from '@/api/promotionService';

interface UsePromotionsResult {
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  fetchPromotions: (params?: {
    active?: boolean;
  }) => Promise<void>;
  getApplicablePromotions: (orderTotal: number, productIds?: number[]) => Promise<Promotion[]>;
}

export const usePromotions = (): UsePromotionsResult => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = async (params?: {
    active?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await promotionService.getPromotions(params);
      setPromotions(response.promotions);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const getApplicablePromotions = async (orderTotal: number, productIds?: number[]): Promise<Promotion[]> => {
    try {
      return await promotionService.getApplicablePromotions(orderTotal, productIds);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
      return [];
    }
  };

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    getApplicablePromotions,
  };
};