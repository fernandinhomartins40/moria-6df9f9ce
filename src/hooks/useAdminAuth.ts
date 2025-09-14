/**
 * Hook para verificação de autenticação e permissões administrativas
 * Previne chamadas desnecessárias à API quando usuário não tem permissão
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminAuthState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  canAccessAdminFeatures: boolean;
  user: any | null;
}

export const useAdminAuth = () => {
  const { customer, loading: authLoading } = useAuth();
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    canAccessAdminFeatures: false,
    user: null
  });

  useEffect(() => {
    const checkAuthState = () => {
      const token = localStorage.getItem('moria_auth_token');
      const isAuthenticated = !!token && !!customer;
      const isAdmin = customer?.role === 'admin';
      const canAccessAdminFeatures = isAuthenticated && isAdmin;

      setAuthState({
        isAuthenticated,
        isAdmin,
        isLoading: authLoading,
        canAccessAdminFeatures,
        user: customer
      });

      // Log estado de autenticação para debug
      console.group('🔐 Admin Auth State');
      console.log('Token disponível:', !!token);
      console.log('Customer:', customer);
      console.log('É admin:', isAdmin);
      console.log('Pode acessar admin:', canAccessAdminFeatures);
      console.groupEnd();
    };

    checkAuthState();
  }, [customer, authLoading]);

  // Função para verificar se pode fazer uma chamada administrativa
  const canMakeAdminCall = useCallback((endpoint: string): boolean => {
    const { canAccessAdminFeatures, isLoading } = authState;

    if (isLoading) {
      console.warn(`⏳ Auth ainda carregando, adiando chamada para ${endpoint}`);
      return false;
    }

    if (!canAccessAdminFeatures) {
      console.warn(`🚫 Acesso negado para ${endpoint}: usuário não é admin`);
      return false;
    }

    console.log(`✅ Autorizado para ${endpoint}`);
    return true;
  }, [authState]);

  // Função para aguardar autenticação completar
  const waitForAuth = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!authState.isLoading) {
        resolve(authState.canAccessAdminFeatures);
        return;
      }

      // Aguardar autenticação completar
      const checkInterval = setInterval(() => {
        if (!authState.isLoading) {
          clearInterval(checkInterval);
          resolve(authState.canAccessAdminFeatures);
        }
      }, 100);

      // Timeout após 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 5000);
    });
  }, [authState]);

  return {
    ...authState,
    canMakeAdminCall,
    waitForAuth,

    // Helpers específicos
    requiresAdminAccess: (action: string = 'esta ação') => {
      if (!authState.canAccessAdminFeatures) {
        console.error(`❌ ${action} requer acesso de administrador`);
        return false;
      }
      return true;
    },

    // Estado específico para diferentes recursos
    canManageProducts: authState.canAccessAdminFeatures,
    canManageOrders: authState.canAccessAdminFeatures,
    canManageUsers: authState.canAccessAdminFeatures,
    canViewReports: authState.canAccessAdminFeatures,
  };
};