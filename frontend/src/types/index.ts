// ========================================
// TIPOS TYPESCRIPT - EXPORTAÇÕES CENTRAIS
// Centralizador de todas as exportações de tipos
// ========================================

// Exportar todos os tipos de banco de dados
export * from './database';

// Exportar todos os tipos de API
export * from './api';

// Re-exportações comuns para facilitar o uso
export type { 
  // Principais entidades
  Product,
  Service, 
  Order,
  OrderItem,
  Promotion,
  Coupon,
  Customer,
  Address,
  
  // Estados e contextos
  CartItem,
  CartState,
  AuthState,
  
  // Formulários
  ProductFormData,
  ServiceFormData,
  PromotionFormData,
  CouponFormData,
  OrderFormData,
  CheckoutFormData,
  LoginCredentials,
  RegisterData,
  
  // API
  ApiResponse,
  DashboardStats,
  HealthCheckResponse,
  
  // Filtros
  ProductFilters,
  ServiceFilters,
  OrderFilters,
  CouponFilters,
  PromotionFilters,
  
  // Hooks
  UseApiReturn,
  UseAuthReturn,
  
  // Outros
  Notification,
  AppConfig,
  CompanyInfo
} from './api';

// Constantes úteis para tipos
export const ORDER_STATUSES = [
  'pending',
  'confirmed', 
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
] as const;

export const DISCOUNT_TYPES = [
  'percentage',
  'fixed', 
  'free_shipping'
] as const;

export const USER_ROLES = [
  'customer',
  'admin'
] as const;

export const ADDRESS_TYPES = [
  'home',
  'work',
  'other'
] as const;

export const PAYMENT_METHODS = [
  'credit_card',
  'pix',
  'bank_slip',
  'cash'
] as const;

export const NOTIFICATION_TYPES = [
  'success',
  'error',
  'warning',
  'info'
] as const;

// Tipos derivados das constantes
export type OrderStatus = typeof ORDER_STATUSES[number];
export type DiscountType = typeof DISCOUNT_TYPES[number];
export type UserRole = typeof USER_ROLES[number];
export type AddressType = typeof ADDRESS_TYPES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];
export type NotificationType = typeof NOTIFICATION_TYPES[number];