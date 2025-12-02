// src/hooks/useAdminCoupons.ts
import { useState, useEffect } from 'react';
import couponService, { Coupon } from '@/api/couponService';
import { handleApiError } from '@/api';
import { useToast } from '@/hooks/use-toast';

interface UseAdminCouponsResult {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  fetchCoupons: () => Promise<void>;
  createCoupon: (data: Partial<Coupon>) => Promise<void>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleCouponStatus: (id: string, currentStatus: boolean) => Promise<void>;
}

export const useAdminCoupons = (): UseAdminCouponsResult => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await couponService.getCoupons({ limit: 100 });
      console.log('📦 Resposta da API getCoupons:', response);

      // A API retorna { data: [...], meta: {...} }
      if (response && response.data && Array.isArray(response.data)) {
        console.log('✅ Cupons carregados:', response.data.length);
        setCoupons(response.data);
      } else {
        console.log('⚠️ Resposta sem cupons ou formato incorreto');
        setCoupons([]);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar cupons:', err);
      const apiError = handleApiError(err);
      setError(apiError.message);
      toast({
        title: 'Erro ao carregar cupons',
        description: apiError.message,
        variant: 'destructive',
      });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (data: Partial<Coupon>) => {
    setCreateLoading(true);

    try {
      const result = await couponService.createCoupon(data);
      setCoupons(prev => [result.data, ...prev]);
      toast({
        title: 'Cupom criado',
        description: `O cupom "${result.data.code}" foi criado com sucesso.`,
      });
      await fetchCoupons(); // Recarregar lista
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao criar cupom',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>) => {
    setUpdateLoading(true);

    try {
      const result = await couponService.updateCoupon(id, data);
      setCoupons(prev => prev.map(coupon =>
        coupon.id === id ? result.data : coupon
      ));
      toast({
        title: 'Cupom atualizado',
        description: `O cupom "${result.data.code}" foi atualizado com sucesso.`,
      });
      await fetchCoupons(); // Recarregar lista
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao atualizar cupom',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    setDeleteLoading(true);

    try {
      await couponService.deleteCoupon(id);
      setCoupons(prev => prev.filter(coupon => coupon.id !== id));
      toast({
        title: 'Cupom excluído',
        description: 'O cupom foi excluído com sucesso.',
      });
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao excluir cupom',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setDeleteLoading(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const result = await couponService.toggleCouponStatus(id, currentStatus);
      setCoupons(prev => prev.map(coupon =>
        coupon.id === id ? result.data : coupon
      ));
      toast({
        title: 'Status atualizado',
        description: `O cupom foi ${result.data.isActive ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (err) {
      const apiError = handleApiError(err);
      toast({
        title: 'Erro ao atualizar status',
        description: apiError.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return {
    coupons,
    loading,
    error,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  };
};
