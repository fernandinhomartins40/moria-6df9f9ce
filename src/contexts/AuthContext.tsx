import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import {
  authService,
  addressService,
  orderService,
  favoriteService,
  handleApiError
} from "@/api";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
  addresses: Address[];
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  trackingCode?: string;
  address: Address;
  paymentMethod: string;
}

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => Promise<{ success: boolean; error?: string }>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  getOrders: () => Promise<{ success: boolean; data?: Order[]; error?: string }>;
  getFavorites: () => Promise<{ success: boolean; data?: number[]; error?: string }>;
  addToFavorites: (productId: number) => Promise<{ success: boolean; error?: string }>;
  removeFromFavorites: (productId: number) => Promise<{ success: boolean; error?: string }>;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const token = authService.getAuthToken();
        if (token) {
          // Try to get user profile
          const customer = await authService.getProfile();
          setState({
            customer,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // If token is invalid, remove it
        authService.removeAuthToken();
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login({ email, password });
      authService.setAuthToken(response.token);
      
      setState({
        customer: response.customer,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: apiError.message };
    }
  };

  const register = async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register(data);
      authService.setAuthToken(response.token);
      
      setState({
        customer: response.customer,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: apiError.message };
    }
  };

  const logout = () => {
    authService.logout();
    setState({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (data: Partial<Customer>) => {
    if (!state.customer) return { success: false, error: "Usuário não autenticado" };
    
    try {
      const updatedCustomer = await authService.updateProfile(data);
      setState(prev => ({
        ...prev,
        customer: updatedCustomer,
      }));
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>) => {
    if (!state.customer) return { success: false, error: "Usuário não autenticado" };
    
    try {
      // In a real implementation, this would call the addressService
      // For now, we'll simulate it
      const newAddress: Address = {
        ...address,
        id: Date.now().toString(),
      };
      
      setState(prev => ({
        ...prev,
        customer: prev.customer ? {
          ...prev.customer,
          addresses: [...prev.customer.addresses, newAddress]
        } : null,
      }));
      
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const updateAddress = async (id: string, addressData: Partial<Address>) => {
    if (!state.customer) return { success: false, error: "Usuário não autenticado" };
    
    try {
      // In a real implementation, this would call the addressService
      // For now, we'll simulate it
      setState(prev => ({
        ...prev,
        customer: prev.customer ? {
          ...prev.customer,
          addresses: prev.customer.addresses.map(addr => 
            addr.id === id ? { ...addr, ...addressData } : addr
          )
        } : null,
      }));
      
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!state.customer) return { success: false, error: "Usuário não autenticado" };
    
    try {
      // In a real implementation, this would call the addressService
      // For now, we'll simulate it
      setState(prev => ({
        ...prev,
        customer: prev.customer ? {
          ...prev.customer,
          addresses: prev.customer.addresses.filter(addr => addr.id !== id)
        } : null,
      }));
      
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const getOrders = async () => {
    try {
      const response = await orderService.getOrders();
      return { success: true, data: response.orders };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const getFavorites = async () => {
    try {
      const favoriteIds = await favoriteService.getFavorites();
      setFavorites(favoriteIds);
      return { success: true, data: favoriteIds };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const addToFavorites = async (productId: number) => {
    try {
      await favoriteService.addToFavorites(productId);
      setFavorites(prev => [...prev, productId]);
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  const removeFromFavorites = async (productId: number) => {
    try {
      await favoriteService.removeFromFavorites(productId);
      setFavorites(prev => prev.filter(id => id !== productId));
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
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
    addAddress,
    updateAddress,
    deleteAddress,
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