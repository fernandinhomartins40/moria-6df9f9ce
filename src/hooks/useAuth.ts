// ========================================
// HOOK DE AUTENTICAÇÃO UNIFICADO
// Usa o novo SupabaseAuthContext para compatibilidade
// ========================================

import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import type { LoginCredentials, RegisterData, Customer, UseAuthReturn } from '@/types';

// Hook principal de autenticação (compatível com código existente)
export function useAuth(): UseAuthReturn {
  return useSupabaseAuth();
}

// Hook para compatibilidade com código legado que usa signIn/signUp
export function useAuthState() {
  const auth = useSupabaseAuth();
  
  return {
    user: auth.supabaseUser,
    session: auth.session,
    loading: auth.isLoading,
    signIn: async (email: string, password: string) => {
      const success = await auth.login({ email, password });
      return success ? {} : { error: 'Falha no login' };
    },
    signUp: async (email: string, password: string) => {
      const success = await auth.register({ email, password, name: '', phone: '' });
      return success ? {} : { error: 'Falha no registro' };
    },
    signOut: auth.logout,
    resetPassword: async (email: string) => {
      // Implementar reset de senha via Supabase
      return { error: 'Reset de senha não implementado' };
    }
  };
}

// Hook para verificar se usuário é admin
export function useIsAdmin() {
  const { user } = useAuth();
  
  return {
    isAdmin: user?.role === 'admin',
    user
  };
}