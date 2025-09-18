// ========================================
// HOOK DE AUTENTICAÇÃO ADMINISTRATIVA - MORIA FRONTEND
// Hook otimizado para gerenciamento de autenticação administrativa
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface AdminAuthHook {
  isLoading: boolean;
  canAccessAdminFeatures: boolean;
  isAdmin: boolean;
  userRole: string | null;
  checkPermissions: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

export const useAdminAuth = (): AdminAuthHook => {
  const queryClient = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Query para verificar permissões administrativas
  const { data: permissionsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: async () => {
      try {
        const response = await apiClient.getProfile();
        if (response?.success && response.data) {
          return {
            role: response.data.role,
            isAdmin: response.data.role === 'admin'
          };
        }
        return { role: null, isAdmin: false };
      } catch (error) {
        console.error('Erro ao verificar permissões administrativas:', error);
        return { role: null, isAdmin: false };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Efeito para atualizar estados locais quando os dados mudarem
  useEffect(() => {
    if (permissionsData) {
      setIsAdmin(permissionsData.isAdmin);
      setUserRole(permissionsData.role);
    }
  }, [permissionsData]);

  // Função para verificar permissões
  const checkPermissions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Função para atualizar permissões
  const refreshPermissions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin-permissions'] });
    await refetch();
  }, [queryClient, refetch]);

  return {
    isLoading,
    canAccessAdminFeatures: isAdmin,
    isAdmin,
    userRole,
    checkPermissions,
    refreshPermissions
  };
};