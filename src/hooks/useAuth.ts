import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/config/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Retornar valores padrão se não estiver dentro do provider
    return {
      user: null,
      session: null,
      loading: false,
      signIn: async () => ({ error: 'Auth não configurado' }),
      signUp: async () => ({ error: 'Auth não configurado' }),
      signOut: async () => {},
      resetPassword: async () => ({ error: 'Auth não configurado' })
    };
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: 'Erro inesperado no login' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: 'Erro inesperado no registro' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (err) {
      return { error: 'Erro ao enviar email de reset' };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };
}

// Hook para verificar se usuário é admin (implementar lógica específica)
export function useIsAdmin() {
  const { user } = useAuth();
  
  // Por enquanto, implementação simples baseada em email
  // Em produção, usar roles/claims ou tabela de admins
  const isAdmin = user?.email?.includes('admin@') || user?.email?.includes('@moria.com');
  
  return {
    isAdmin: !!isAdmin,
    user
  };
}