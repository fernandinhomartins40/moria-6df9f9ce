import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Customer>) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for development
const mockCustomer: Customer = {
  id: "1",
  name: "João Silva",
  email: "joao@email.com",
  phone: "(11) 99999-9999",
  cpf: "123.456.789-00",
  birthDate: "1990-05-15",
  createdAt: "2024-01-15",
  totalOrders: 5,
  totalSpent: 2450.00,
  addresses: [
    {
      id: "1",
      type: "home",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      isDefault: true
    }
  ]
};

const mockOrders: Order[] = [
  {
    id: "1",
    customerId: "1",
    items: [
      { id: 1, name: "Filtro de Óleo Bosch", price: 35.90, quantity: 1 },
      { id: 2, name: "Pastilha de Freio Dianteira", price: 89.90, quantity: 2 }
    ],
    total: 215.70,
    status: "delivered",
    createdAt: "2024-08-01",
    address: mockCustomer.addresses[0],
    paymentMethod: "Cartão de Crédito",
    trackingCode: "BR123456789"
  },
  {
    id: "2",
    customerId: "1",
    items: [
      { id: 3, name: "Óleo Motor Castrol 5W30", price: 45.90, quantity: 4 }
    ],
    total: 183.60,
    status: "shipped",
    createdAt: "2024-08-05",
    address: mockCustomer.addresses[0],
    paymentMethod: "PIX",
    trackingCode: "BR987654321",
    estimatedDelivery: "2024-08-10"
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    customer: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const [favorites, setFavorites] = useState<number[]>([1, 3, 5]);

  useEffect(() => {
    // Simulate loading check for existing session
    const timer = setTimeout(() => {
      const savedAuth = localStorage.getItem('moria_auth');
      if (savedAuth) {
        setState({
          customer: mockCustomer,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (email === "joao@email.com" && password === "123456") {
      localStorage.setItem('moria_auth', JSON.stringify({ email, timestamp: Date.now() }));
      setState({
        customer: mockCustomer,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
    
    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newCustomer: Customer = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      addresses: [],
      createdAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpent: 0,
    };

    localStorage.setItem('moria_auth', JSON.stringify({ email: data.email, timestamp: Date.now() }));
    setState({
      customer: newCustomer,
      isAuthenticated: true,
      isLoading: false,
    });
    
    return true;
  };

  const logout = () => {
    localStorage.removeItem('moria_auth');
    setState({
      customer: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateProfile = async (data: Partial<Customer>): Promise<boolean> => {
    if (!state.customer) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setState(prev => ({
      ...prev,
      customer: prev.customer ? { ...prev.customer, ...data } : null,
    }));
    
    return true;
  };

  const addAddress = async (address: Omit<Address, 'id'>): Promise<boolean> => {
    if (!state.customer) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    
    return true;
  };

  const updateAddress = async (id: string, addressData: Partial<Address>): Promise<boolean> => {
    if (!state.customer) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setState(prev => ({
      ...prev,
      customer: prev.customer ? {
        ...prev.customer,
        addresses: prev.customer.addresses.map(addr => 
          addr.id === id ? { ...addr, ...addressData } : addr
        )
      } : null,
    }));
    
    return true;
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    if (!state.customer) return false;
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setState(prev => ({
      ...prev,
      customer: prev.customer ? {
        ...prev.customer,
        addresses: prev.customer.addresses.filter(addr => addr.id !== id)
      } : null,
    }));
    
    return true;
  };

  const getOrders = async (): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockOrders;
  };

  const getFavorites = async (): Promise<number[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return favorites;
  };

  const addToFavorites = async (productId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setFavorites(prev => [...prev, productId]);
    return true;
  };

  const removeFromFavorites = async (productId: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setFavorites(prev => prev.filter(id => id !== productId));
    return true;
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