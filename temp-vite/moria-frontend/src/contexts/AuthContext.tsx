import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiClient } from "../services/api";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  role: 'customer' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  total_orders: number;
  total_spent: number;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: any;
  items: OrderItem[];
  subtotal_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  notes?: string;
  admin_notes?: string;
  coupon_code?: string;
  applied_promotions: any[];
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  type: 'product' | 'service';
  item_id: number;
  item_name: string;
  item_description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  original_unit_price: number;
  applied_promotions: any[];
  item_specifications: any;
}

interface AuthState {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  getOrders: () => Promise<Order[]>;
  getFavorites: () => Promise<number[]>;
  addToFavorites: (productId: number) => Promise<boolean>;
  removeFromFavorites: (productId: number) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
  birth_date?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [favorites, setFavorites] = useState<number[]>([]);

  // Verificar se há token salvo e validar na inicialização
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('moria_auth_token');

      if (token) {
        try {
          const result = await apiClient.getProfile();
          if (result.success) {
            setState({
              customer: result.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Token inválido, limpar
            localStorage.removeItem('moria_auth_token');
            localStorage.removeItem('moria_refresh_token');
            setState({
              customer: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          localStorage.removeItem('moria_auth_token');
          localStorage.removeItem('moria_refresh_token');
          setState({
            customer: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await apiClient.login({ email, password });

      if (result.success && result.data) {
        setState({
          customer: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await apiClient.register(data);

      if (result.success && result.data) {
        setState({
          customer: result.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setState({
        customer: null,
        isAuthenticated: false,
        isLoading: false,
      });
      setFavorites([]);
    }
  };

  const updateProfile = async (data: Partial<Customer>): Promise<boolean> => {
    if (!state.customer) return false;

    try {
      const result = await apiClient.updateProfile(data);

      if (result.success) {
        setState(prev => ({
          ...prev,
          customer: result.data.user,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const result = await apiClient.changePassword({ currentPassword, newPassword });
      return result.success;
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return false;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (!state.isAuthenticated) return;

    try {
      const result = await apiClient.getProfile();
      if (result.success) {
        setState(prev => ({
          ...prev,
          customer: result.data.user,
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  const getOrders = async (): Promise<Order[]> => {
    try {
      const result = await apiClient.getMyOrders();
      if (result.success) {
        return result.data.data || result.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  };

  const getFavorites = async (): Promise<number[]> => {
    // TODO: Implementar endpoint de favoritos no backend
    // Por enquanto, retornar array vazio
    try {
      // const result = await apiClient.get('/favorites');
      // if (result.success) {
      //   return result.data.map(fav => fav.product_id);
      // }
      return favorites;
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return [];
    }
  };

  const addToFavorites = async (productId: number): Promise<boolean> => {
    try {
      // TODO: Implementar endpoint de favoritos no backend
      // const result = await apiClient.post('/favorites', { product_id: productId });
      // if (result.success) {
        setFavorites(prev => [...prev, productId]);
        return true;
      // }
      // return false;
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      return false;
    }
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    try {
      // TODO: Implementar endpoint de favoritos no backend
      // const result = await apiClient.delete(`/favorites/${productId}`);
      // if (result.success) {
        setFavorites(prev => prev.filter(id => id !== productId));
        return true;
      // }
      // return false;
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    customer: state.customer,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUserData,
    getOrders,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}