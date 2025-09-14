// ========================================
// HOOK DE AUTENTICAÇÃO
// Usa o AuthContext local para gerenciamento de autenticação
// ========================================

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Hook principal de autenticação
export function useAuth() {
  return useAuthContext();
}

// Hook para compatibilidade com código legado que usa signIn/signUp
export function useAuthState() {
  const auth = useAuthContext();

  return {
    user: auth.customer ? {
      id: auth.customer.id,
      email: auth.customer.email,
      user_metadata: {
        name: auth.customer.name,
        phone: auth.customer.phone
      }
    } : null,
    session: auth.isAuthenticated ? { user: auth.customer } : null,
    loading: auth.isLoading,
    signIn: async (email: string, password: string) => {
      const success = await auth.login(email, password);
      return success ? {} : { error: 'Falha no login' };
    },
    signUp: async (email: string, password: string, userData?: any) => {
      const success = await auth.register({
        email,
        password,
        name: userData?.name || '',
        phone: userData?.phone || ''
      });
      return success ? {} : { error: 'Falha no registro' };
    },
    signOut: auth.logout,
    updateUser: async (updates: any) => {
      const success = await auth.updateProfile(updates);
      return success ? {} : { error: 'Falha ao atualizar' };
    }
  };
}