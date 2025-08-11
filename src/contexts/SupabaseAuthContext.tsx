// ========================================
// SUPABASE AUTH CONTEXT - Sistema de autenticação real
// Substitui o AuthContext mock por autenticação funcional
// ========================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import type { 
  Customer, 
  Address, 
  Order, 
  AuthState, 
  LoginCredentials, 
  RegisterData, 
  UseAuthReturn 
} from '@/types';

interface SupabaseAuthContextType extends UseAuthReturn {
  supabaseUser: SupabaseUser | null;
  session: Session | null;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function SupabaseAuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    role: null
  });
  
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Carregar perfil do usuário a partir do Supabase
  const loadUserProfile = async (userId: string): Promise<Customer | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          addresses (*)
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar perfil:', error);
        return null;
      }

      if (!profile) return null;

      // Transformar dados do banco para formato da aplicação
      const customer: Customer = {
        id: profile.id,
        name: profile.name,
        email: supabaseUser?.email || '',
        phone: profile.phone || '',
        cpf: profile.cpf,
        birthDate: profile.birth_date,
        addresses: (profile.addresses || []).map((addr: any): Address => ({
          id: addr.id,
          type: addr.type,
          street: addr.street,
          number: addr.number,
          complement: addr.complement,
          neighborhood: addr.neighborhood,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zip_code,
          isDefault: addr.is_default
        })),
        createdAt: profile.created_at,
        totalOrders: profile.total_orders || 0,
        totalSpent: profile.total_spent || 0,
        role: profile.role
      };

      return customer;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
  };

  // Inicializar autenticação
  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao obter sessão:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        loadUserProfile(session.user.id).then(customer => {
          setState({
            user: customer,
            isAuthenticated: !!customer,
            isLoading: false,
            role: customer?.role || null
          });
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          role: null
        });
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setSupabaseUser(session?.user ?? null);

        if (session?.user) {
          const customer = await loadUserProfile(session.user.id);
          setState({
            user: customer,
            isAuthenticated: !!customer,
            isLoading: false,
            role: customer?.role || null
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            role: null
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Erro no login:', error);
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (data.user) {
        const customer = await loadUserProfile(data.user.id);
        setState({
          user: customer,
          isAuthenticated: !!customer,
          isLoading: false,
          role: customer?.role || null
        });
        return true;
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Erro no registro:', authError);
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (!authData.user) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          name: data.name,
          phone: data.phone,
          cpf: data.cpf,
          birth_date: data.birthDate,
          role: 'customer',
          total_orders: 0,
          total_spent: 0
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Tentar deletar o usuário criado
        await supabase.auth.signOut();
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Se chegou até aqui, o registro foi bem-sucedido
      const customer = await loadUserProfile(authData.user.id);
      setState({
        user: customer,
        isAuthenticated: !!customer,
        isLoading: false,
        role: customer?.role || null
      });
      
      return true;
    } catch (error) {
      console.error('Erro no registro:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        role: null
      });
    }
  };

  const updateProfile = async (profileData: Partial<Customer>): Promise<boolean> => {
    if (!supabaseUser || !state.user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          cpf: profileData.cpf,
          birth_date: profileData.birthDate,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', supabaseUser.id);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }

      // Atualizar estado local
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...profileData } : null
      }));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const contextValue: SupabaseAuthContextType = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    supabaseUser,
    session,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <SupabaseAuthContext.Provider value={contextValue}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth(): SupabaseAuthContextType {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth deve ser usado dentro de um SupabaseAuthProvider');
  }
  return context;
}

// Hook para compatibilidade com código existente
export function useAuth(): UseAuthReturn {
  const context = useSupabaseAuth();
  return {
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    login: context.login,
    register: context.register,
    logout: context.logout,
    updateProfile: context.updateProfile
  };
}