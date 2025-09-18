// ========================================
// HOOKS DE REACT QUERY - MORIA FRONTEND
// Hooks customizados para gerenciamento de dados com React Query
// ========================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// ========================================
// HOOKS DE PRODUTOS
// ========================================

export const useProducts = (filters?: any) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => apiClient.getProduct(id),
    enabled: !!id,
  });
};

export const usePopularProducts = (limit?: number) => {
  return useQuery({
    queryKey: ['popularProducts', limit],
    queryFn: () => apiClient.getPopularProducts(limit),
  });
};

export const useProductsOnSale = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['productsOnSale', page, limit],
    queryFn: () => apiClient.getProductsOnSale(page, limit),
  });
};

export const useProductCategories = () => {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: () => apiClient.getProductCategories(),
  });
};

// ========================================
// HOOKS DE SERVIÇOS
// ========================================

export const useServices = (filters?: any) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => apiClient.getServices(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => apiClient.getService(id),
    enabled: !!id,
  });
};

export const usePopularServices = (limit?: number) => {
  return useQuery({
    queryKey: ['popularServices', limit],
    queryFn: () => apiClient.getPopularServices(limit),
  });
};

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['serviceCategories'],
    queryFn: () => apiClient.getServiceCategories(),
  });
};

// ========================================
// HOOKS DE PEDIDOS
// ========================================

export const useOrders = (filters?: any) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => apiClient.getOrders(filters),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => apiClient.getOrder(id),
    enabled: !!id,
  });
};

export const useMyOrders = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['myOrders', page, limit],
    queryFn: () => apiClient.getMyOrders(page, limit),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => apiClient.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status, adminNotes }: { orderId: string; status: string; adminNotes?: string }) => 
      apiClient.updateOrderStatus(orderId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// ========================================
// HOOKS DE PROMOÇÕES E CUPONS
// ========================================

export const usePromotions = (filters?: any) => {
  return useQuery({
    queryKey: ['promotions', filters],
    queryFn: () => apiClient.getPromotions(filters),
  });
};

export const useActivePromotions = () => {
  return useQuery({
    queryKey: ['activePromotions'],
    queryFn: () => apiClient.getActivePromotions(),
  });
};

export const useCoupons = (filters?: any) => {
  return useQuery({
    queryKey: ['coupons', filters],
    queryFn: () => apiClient.getCoupons(filters),
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: ({ code, orderAmount }: { code: string; orderAmount?: number }) => 
      apiClient.validateCoupon(code, orderAmount),
  });
};

// ========================================
// HOOKS DE AUTENTICAÇÃO
// ========================================

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.getProfile(),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      apiClient.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: any) => apiClient.register(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (profileData: any) => apiClient.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};