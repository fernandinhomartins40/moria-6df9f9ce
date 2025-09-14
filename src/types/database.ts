// ========================================
// TIPOS TYPESCRIPT PARA BANCO DE DADOS
// Define todas as interfaces para as entidades do banco
// ========================================

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  sale_price?: number;
  promo_price?: number;
  images: string[];
  stock: number;
  is_active: boolean;
  rating: number;
  specifications: Record<string, any>;
  vehicle_compatibility: string[];
  created_at: string;
  updated_at: string;
}

export interface DatabaseService {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  estimated_time: string;
  specifications: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: Record<string, any>;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface DatabaseOrderItem {
  id: string;
  order_id: string;
  type: 'product' | 'service';
  item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DatabasePromotion {
  id: string;
  title: string;
  description: string;
  type: string;
  conditions: Record<string, any>;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  max_discount?: number;
  category?: string;
  min_amount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCoupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_uses?: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfile {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  role: 'customer' | 'admin';
  addresses: DatabaseAddress[];
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAddress {
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

export interface DatabaseSettings {
  id: string;
  key: string;
  value: string;
  description?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCompanyInfo {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  logo_url?: string;
  website?: string;
  social_media?: Record<string, string>;
  business_hours?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFavorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

// Views do banco de dados
export interface ProductsView extends DatabaseProduct {
  effective_price: number;
  discount_percentage: number;
}

// Tipos para filtros e queries
export interface ProductFilters {
  category?: string;
  active?: boolean | string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
}

export interface ServiceFilters {
  active?: boolean | string;
  category?: string;
  search?: string;
}

export interface OrderFilters {
  status?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CouponFilters {
  active?: boolean | string;
  type?: string;
  search?: string;
}

export interface PromotionFilters {
  active?: boolean | string;
  type?: string;
  category?: string;
}

// Tipos para operações de criação/atualização
export type CreateProductData = Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProductData = Partial<CreateProductData>;

export type CreateServiceData = Omit<DatabaseService, 'id' | 'created_at' | 'updated_at'>;
export type UpdateServiceData = Partial<CreateServiceData>;

export type CreateOrderData = Omit<DatabaseOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
export type UpdateOrderData = Partial<Omit<CreateOrderData, 'customer_name' | 'customer_email'>>;

export type CreatePromotionData = Omit<DatabasePromotion, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePromotionData = Partial<CreatePromotionData>;

export type CreateCouponData = Omit<DatabaseCoupon, 'id' | 'used_count' | 'created_at' | 'updated_at'>;
export type UpdateCouponData = Partial<CreateCouponData>;