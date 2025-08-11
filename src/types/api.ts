// ========================================
// TIPOS TYPESCRIPT PARA API E RESPONSES
// Define interfaces para respostas da API e transformações de dados
// ========================================

import { 
  DatabaseProduct, 
  DatabaseService, 
  DatabaseOrder, 
  DatabaseOrderItem,
  DatabasePromotion,
  DatabaseCoupon,
  DatabaseProfile,
  DatabaseAddress,
  ProductsView 
} from './database';

// Response padrão da API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  total?: number;
  message?: string;
  error?: string;
}

// Tipos para produtos (frontend)
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  promoPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  rating: number;
  specifications: Record<string, any>;
  vehicleCompatibility: string[];
  createdAt: string;
  effective_price?: number;
  discount_percentage?: number;
}

// Tipos para serviços (frontend)
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedTime: string;
  specifications: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

// Tipos para pedidos (frontend)
export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: Record<string, any>;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
  estimatedDelivery?: string;
  trackingCode?: string;
  paymentMethod?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  type: 'product' | 'service';
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

// Tipos para promoções (frontend)
export interface Promotion {
  id: string;
  name: string; // Mapeado de 'title' no banco
  title?: string; // Para compatibilidade
  description: string;
  type: string;
  conditions: Record<string, any>;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscount?: number;
  category?: string;
  minAmount?: number;
  startsAt: string; // Mapeado de 'start_date'
  endsAt: string; // Mapeado de 'end_date'
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Tipos para cupons (frontend)
export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Tipos para usuário/cliente (frontend)
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
  role?: 'customer' | 'admin';
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

// Tipos para carrinho de compras
export interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  salePrice?: number;
  promoPrice?: number;
  image?: string;
  quantity: number;
  stock?: number;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  discount: number;
  appliedCoupons: string[];
}

// Tipos para estatísticas do dashboard
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalServices: number;
  recentOrders: Order[];
  revenue?: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  topProducts?: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

// Tipos para formulários de criação/edição
export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  salePrice?: number;
  promoPrice?: number;
  images: string[];
  stock: number;
  isActive: boolean;
  rating?: number;
  specifications: Record<string, any>;
  vehicleCompatibility: string[];
}

export interface ServiceFormData {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  estimatedTime: string;
  specifications: Record<string, any>;
  isActive: boolean;
}

export interface PromotionFormData {
  name: string;
  description: string;
  type: string;
  conditions: Record<string, any>;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  maxDiscount?: number;
  category?: string;
  minAmount?: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface CouponFormData {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxUses?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: Record<string, any>;
  items: Array<{
    type: 'product' | 'service';
    itemId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod: 'credit_card' | 'pix' | 'bank_slip' | 'cash';
  notes?: string;
}

// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  cpf?: string;
  birthDate?: string;
}

export interface AuthState {
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'customer' | 'admin' | null;
}

// Tipos para configurações
export interface AppConfig {
  [key: string]: any;
}

export interface CompanyInfo {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  logoUrl?: string;
  website?: string;
  socialMedia?: Record<string, string>;
  businessHours?: Record<string, string>;
}

// Tipos para notificações
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// Tipos para hooks e context
export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseAuthReturn {
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<boolean>;
}

// Tipos para health check
export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
  database: {
    status: string;
    provider: string;
  };
}