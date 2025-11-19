// src/api/adminService.ts
import apiClient from './apiClient';

// ==================== INTERFACES ====================

export interface StoreOrder {
  id: string;
  userId: string;
  customerName: string;
  customerWhatsApp: string;
  items: OrderItem[];
  total: number;
  hasProducts: boolean;
  hasServices: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  source: 'website' | 'whatsapp' | 'phone';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type?: 'product' | 'service';
}

export interface Quote {
  id: string;
  userId: string;
  customerName: string;
  customerWhatsApp: string;
  items: QuoteItem[];
  total: number;
  status: 'PENDING' | 'ANALYZING' | 'QUOTED' | 'APPROVED' | 'REJECTED' | 'pending' | 'analyzing' | 'responded' | 'accepted' | 'rejected';
  sessionId?: string;
  hasLinkedOrder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  quantity: number;
  price?: number | null;
  quotedPrice?: number | null;
}

export interface AdminService {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  specifications?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  sku: string;
  supplier: string;
  costPrice: number;
  salePrice: number;
  promoPrice?: number;
  stock: number;
  minStock: number;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPromotion {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  startDate: string;
  endDate: string;
  products?: string[];
  services?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisionalUser {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  cpf?: string;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt: string;
  updatedAt: string;
}

export interface AdminRevision {
  id: string;
  customerId: string;
  vehicleId: string;
  date: string;
  mileage: number | null;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  checklistItems: any;
  generalNotes: string | null;
  recommendations: string | null;
  assignedMechanicId: string | null;
  mechanicName: string | null;
  mechanicNotes: string | null;
  assignedAt: string | null;
  transferHistory: any[] | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  vehicle?: {
    id: string;
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedMechanic?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
  activeProducts: number;
  lowStockProducts: number;
  activeCoupons: number;
  recentOrders: StoreOrder[];
}

// ==================== CREATE REQUESTS ====================

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  estimatedTime: string;
  basePrice?: number;
  specifications?: string;
  isActive?: boolean;
}

export interface CreateCouponRequest {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  minValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit?: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  sku: string;
  supplier: string;
  costPrice: number;
  salePrice: number;
  promoPrice?: number;
  stock: number;
  minStock: number;
  images?: string[];
  isActive?: boolean;
}

export interface CreatePromotionRequest {
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  startDate: string;
  endDate: string;
  products?: string[];
  services?: string[];
  isActive?: boolean;
}

// ==================== SERVICE CLASS ====================

class AdminService {
  // ==================== DASHBOARD ====================

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  }

  // ==================== ORDERS ====================

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ orders: StoreOrder[]; totalCount: number }> {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  }

  async getOrderById(id: string): Promise<StoreOrder> {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<StoreOrder> {
    const response = await apiClient.patch(`/admin/orders/${id}/status`, { status });
    return response.data;
  }

  async createAdminOrder(data: {
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
      type: 'HOME' | 'WORK' | 'OTHER';
    };
    items: Array<{
      productId?: string;
      serviceId?: string;
      type: 'PRODUCT' | 'SERVICE';
      quantity: number;
    }>;
    paymentMethod: string;
    couponCode?: string;
  }): Promise<StoreOrder> {
    const response = await apiClient.post('/orders/guest', data);
    return response.data.data;
  }

  // ==================== QUOTES ====================

  async getQuotes(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ quotes: Quote[]; totalCount: number }> {
    const response = await apiClient.get('/admin/quotes', { params });
    return response.data;
  }

  async getQuoteById(id: string): Promise<Quote> {
    const response = await apiClient.get(`/admin/quotes/${id}`);
    return response.data;
  }

  async updateQuotePrices(id: string, items: Array<{ id: string; quotedPrice: number }>): Promise<Quote> {
    const response = await apiClient.patch(`/admin/quotes/${id}/prices`, { items });
    return response.data;
  }

  async approveQuote(id: string): Promise<Quote> {
    const response = await apiClient.patch(`/admin/quotes/${id}/approve`);
    return response.data;
  }

  async rejectQuote(id: string): Promise<Quote> {
    const response = await apiClient.patch(`/admin/quotes/${id}/reject`);
    return response.data;
  }

  async updateQuoteStatus(id: string, status: string): Promise<Quote> {
    const response = await apiClient.patch(`/admin/quotes/${id}/status`, { status });
    return response.data;
  }

  async createQuote(data: {
    customerId?: string;
    customerData?: {
      name: string;
      email: string;
      phone: string;
      cpf?: string;
    };
    items: Array<{
      serviceId: string;
      quantity: number;
      quotedPrice: number;
      observations?: string;
    }>;
    observations?: string;
    validityDays: number;
    address?: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      type: 'HOME' | 'WORK' | 'OTHER';
    };
    sendToClient: boolean;
  }): Promise<Quote> {
    const response = await apiClient.post('/admin/quotes', data);
    return response.data;
  }

  // ==================== SERVICES ====================

  async getServices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<{ services: AdminService[]; totalCount: number }> {
    const response = await apiClient.get('/admin/services', { params });
    return {
      services: response.data.data || [],
      totalCount: response.data.meta?.totalCount || 0
    };
  }

  async getServiceById(id: string): Promise<AdminService> {
    const response = await apiClient.get(`/admin/services/${id}`);
    return response.data;
  }

  async createService(data: CreateServiceRequest): Promise<AdminService> {
    const response = await apiClient.post('/admin/services', data);
    return response.data;
  }

  async updateService(id: string, data: Partial<CreateServiceRequest>): Promise<AdminService> {
    const response = await apiClient.put(`/admin/services/${id}`, data);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/admin/services/${id}`);
  }

  async toggleServiceStatus(id: string): Promise<AdminService> {
    const response = await apiClient.patch(`/admin/services/${id}/toggle-status`);
    return response.data;
  }

  // ==================== COUPONS ====================

  async getCoupons(params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }): Promise<{ coupons: AdminCoupon[]; totalCount: number }> {
    const response = await apiClient.get('/admin/coupons', { params });
    return {
      coupons: response.data.data || [],
      totalCount: response.data.meta?.totalCount || 0
    };
  }

  async getCouponById(id: string): Promise<AdminCoupon> {
    const response = await apiClient.get(`/admin/coupons/${id}`);
    return response.data;
  }

  async createCoupon(data: CreateCouponRequest): Promise<AdminCoupon> {
    const response = await apiClient.post('/admin/coupons', data);
    return response.data;
  }

  async updateCoupon(id: string, data: Partial<CreateCouponRequest>): Promise<AdminCoupon> {
    const response = await apiClient.put(`/admin/coupons/${id}`, data);
    return response.data;
  }

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
  }

  async toggleCouponStatus(id: string): Promise<AdminCoupon> {
    const response = await apiClient.patch(`/admin/coupons/${id}/toggle-status`);
    return response.data;
  }

  // ==================== PRODUCTS ====================

  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
  }): Promise<{ products: AdminProduct[]; totalCount: number }> {
    const response = await apiClient.get('/admin/products', { params });
    return {
      products: response.data.data || [],
      totalCount: response.data.meta?.totalCount || 0
    };
  }

  async getProductById(id: string): Promise<AdminProduct> {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  }

  async createProduct(data: CreateProductRequest): Promise<AdminProduct> {
    const response = await apiClient.post('/admin/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<CreateProductRequest>): Promise<AdminProduct> {
    const response = await apiClient.put(`/admin/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/admin/products/${id}`);
  }

  async toggleProductStatus(id: string): Promise<AdminProduct> {
    const response = await apiClient.patch(`/admin/products/${id}/toggle-status`);
    return response.data;
  }

  async updateProductStock(id: string, stock: number): Promise<AdminProduct> {
    const response = await apiClient.patch(`/admin/products/${id}/stock`, { stock });
    return response.data;
  }

  // ==================== PROMOTIONS ====================

  async getPromotions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: boolean;
  }): Promise<{ promotions: AdminPromotion[]; totalCount: number }> {
    const response = await apiClient.get('/admin/promotions', { params });
    return response.data;
  }

  async getPromotionById(id: string): Promise<AdminPromotion> {
    const response = await apiClient.get(`/admin/promotions/${id}`);
    return response.data;
  }

  async createPromotion(data: CreatePromotionRequest): Promise<AdminPromotion> {
    const response = await apiClient.post('/admin/promotions', data);
    return response.data;
  }

  async updatePromotion(id: string, data: Partial<CreatePromotionRequest>): Promise<AdminPromotion> {
    const response = await apiClient.put(`/admin/promotions/${id}`, data);
    return response.data;
  }

  async deletePromotion(id: string): Promise<void> {
    await apiClient.delete(`/admin/promotions/${id}`);
  }

  async togglePromotionStatus(id: string): Promise<AdminPromotion> {
    const response = await apiClient.patch(`/admin/promotions/${id}/toggle-status`);
    return response.data;
  }

  // ==================== CUSTOMERS ====================

  async getCustomers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    status?: string;
  }): Promise<{ customers: ProvisionalUser[]; totalCount: number }> {
    const response = await apiClient.get('/admin/customers', { params });
    return response.data;
  }

  async getCustomerById(id: string): Promise<ProvisionalUser> {
    const response = await apiClient.get(`/admin/customers/${id}`);
    return response.data;
  }

  async updateCustomerLevel(id: string, level: string): Promise<ProvisionalUser> {
    const response = await apiClient.patch(`/admin/customers/${id}/level`, { level });
    return response.data;
  }

  async updateCustomerStatus(id: string, status: string): Promise<ProvisionalUser> {
    const response = await apiClient.patch(`/admin/customers/${id}/status`, { status });
    return response.data;
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
  }): Promise<ProvisionalUser> {
    const response = await apiClient.post('/admin/customers', data);
    return response.data;
  }

  async createCustomerAddress(customerId: string, data: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    type: 'HOME' | 'WORK' | 'OTHER';
  }): Promise<{
    id: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    type: string;
  }> {
    const response = await apiClient.post(`/admin/customers/${customerId}/addresses`, data);
    return response.data;
  }

  async createVehicleForCustomer(customerId: string, data: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
    mileage?: number;
    chassisNumber?: string;
  }): Promise<any> {
    const response = await apiClient.post(`/admin/customers/${customerId}/vehicles`, data);
    return response.data;
  }

  // ==================== REVISIONS ====================

  async getRevisions(params?: {
    page?: number;
    limit?: number;
    customerId?: string;
    vehicleId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: AdminRevision[]; meta: any }> {
    const response = await apiClient.get('/admin/revisions', { params });
    return response.data;
  }

  async getRevisionById(id: string): Promise<AdminRevision> {
    const response = await apiClient.get(`/admin/revisions/${id}`);
    return response.data;
  }

  async updateRevisionStatus(id: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<AdminRevision> {
    const actionMap = {
      'IN_PROGRESS': 'start',
      'COMPLETED': 'complete',
      'CANCELLED': 'cancel'
    };
    const action = actionMap[status];
    const response = await apiClient.patch(`/admin/revisions/${id}/${action}`);
    return response.data;
  }

  async deleteRevision(id: string): Promise<void> {
    await apiClient.delete(`/admin/revisions/${id}`);
  }

  async startRevision(id: string): Promise<AdminRevision> {
    const response = await apiClient.patch(`/admin/revisions/${id}/start`);
    return response.data.data;
  }

  async completeRevision(id: string): Promise<AdminRevision> {
    const response = await apiClient.patch(`/admin/revisions/${id}/complete`);
    return response.data.data;
  }

  async updateRevision(id: string, data: {
    mechanicNotes?: string;
    checklistItems?: any;
    recommendations?: string;
  }): Promise<AdminRevision> {
    const response = await apiClient.put(`/admin/revisions/${id}`, data);
    return response.data.data;
  }

  // ==================== ADMIN USERS MANAGEMENT ====================

  /**
   * Create new admin user
   * Only ADMIN and SUPER_ADMIN
   */
  async createAdminUser(data: {
    email: string;
    password: string;
    name: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
  }): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
  }> {
    const response = await apiClient.post('/auth/admin/users', data);
    return response.data.data;
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{
    data: Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      status: string;
      createdAt: string;
      lastLoginAt?: string;
    }>;
    meta: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    const response = await apiClient.get('/auth/admin/users', { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  }

  /**
   * Update admin user
   */
  async updateAdminUser(
    id: string,
    data: {
      name?: string;
      role?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'STAFF';
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    }
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
  }> {
    const response = await apiClient.put(`/auth/admin/users/${id}`, data);
    return response.data.data;
  }

  /**
   * Delete (soft) admin user
   * Only SUPER_ADMIN
   */
  async deleteAdminUser(id: string): Promise<void> {
    await apiClient.delete(`/auth/admin/users/${id}`);
  }
}

export default new AdminService();
