// ========================================
// SUPABASE API SERVICE - Mantendo compatibilidade com painéis existentes
// Substitui as chamadas do backend Node.js por Supabase
// ========================================

import { supabase } from '@/config/supabase';

class SupabaseApiService {
  constructor() {
    this.enableLogs = import.meta.env.DEV;
  }

  /**
   * Log helper para desenvolvimento
   */
  log(message: string, data: any = null) {
    if (this.enableLogs) {
      console.log(`[SupabaseAPI] ${message}`, data || '');
    }
  }

  /**
   * Helper para formatar resposta no formato esperado pelo frontend
   */
  formatResponse(data: any, total?: number) {
    return {
      success: true,
      data: data,
      total: total || (Array.isArray(data) ? data.length : 1)
    };
  }

  /**
   * Helper para tratar erros
   */
  handleError(error: any, operation: string) {
    const message = error.message || `Erro na operação: ${operation}`;
    this.log(`Error in ${operation}:`, message);
    throw new Error(message);
  }

  // ========================================
  // HEALTH CHECK - Verificar conexão Supabase
  // ========================================

  async healthCheck() {
    try {
      const { data, error } = await supabase.from('products').select('count').limit(1);
      
      if (error) throw error;
      
      return {
        success: true,
        message: 'Supabase conectado com sucesso',
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
        database: { status: 'connected', provider: 'supabase' }
      };
    } catch (error) {
      this.handleError(error, 'healthCheck');
    }
  }

  // ========================================
  // DASHBOARD STATS - Para painel do lojista
  // ========================================

  async getDashboardStats() {
    try {
      // Buscar estatísticas em paralelo
      const [productsResult, ordersResult, servicesResult, recentOrdersResult] = await Promise.all([
        supabase.from('products').select('id').eq('is_active', true),
        supabase.from('orders').select('id'),
        supabase.from('services').select('id').eq('is_active', true),
        supabase.from('orders').select(`
          id, order_number, customer_name, total_amount, status, created_at,
          order_items (*)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      const totalProducts = productsResult.data?.length || 0;
      const totalOrders = ordersResult.data?.length || 0;
      const totalServices = servicesResult.data?.length || 0;
      const recentOrders = recentOrdersResult.data || [];

      return this.formatResponse({
        totalProducts,
        totalOrders,
        totalServices,
        recentOrders
      });
    } catch (error) {
      this.handleError(error, 'getDashboardStats');
    }
  }

  // ========================================
  // PRODUCTS - CRUD Completo para painel lojista
  // ========================================

  async getProducts(filters: any = {}) {
    try {
      let query = supabase.from('products_view').select('*');

      // Aplicar filtros
      if (filters.category) {
        query = query.ilike('category', `%${filters.category}%`);
      }

      if (filters.active !== undefined) {
        query = query.eq('is_active', filters.active === 'true' || filters.active === true);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados para formato esperado pelo frontend
      const transformedData = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        salePrice: product.sale_price,
        promoPrice: product.promo_price,
        images: product.images || [],
        stock: product.stock,
        isActive: product.is_active,
        rating: product.rating,
        specifications: product.specifications || {},
        vehicleCompatibility: product.vehicle_compatibility || [],
        createdAt: product.created_at,
        effective_price: product.effective_price,
        discount_percentage: product.discount_percentage
      }));

      return this.formatResponse(transformedData);
    } catch (error) {
      this.handleError(error, 'getProducts');
    }
  }

  async getProduct(id: string) {
    try {
      const { data, error } = await supabase
        .from('products_view')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Produto não encontrado');
      }

      const transformedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        salePrice: data.sale_price,
        promoPrice: data.promo_price,
        images: data.images || [],
        stock: data.stock,
        isActive: data.is_active,
        rating: data.rating,
        specifications: data.specifications || {},
        vehicleCompatibility: data.vehicle_compatibility || [],
        createdAt: data.created_at
      };

      return this.formatResponse(transformedData);
    } catch (error) {
      this.handleError(error, 'getProduct');
    }
  }

  async createProduct(productData: any) {
    try {
      // Transformar dados para formato Supabase
      const supabaseData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        sale_price: productData.salePrice,
        promo_price: productData.promoPrice,
        images: productData.images || [],
        stock: productData.stock || 0,
        is_active: productData.isActive ?? true,
        rating: productData.rating || 0,
        specifications: productData.specifications || {},
        vehicle_compatibility: productData.vehicleCompatibility || []
      };

      const { data, error } = await supabase
        .from('products')
        .insert(supabaseData)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'createProduct');
    }
  }

  async updateProduct(id: string, productData: any) {
    try {
      const supabaseData = {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        sale_price: productData.salePrice,
        promo_price: productData.promoPrice,
        images: productData.images || [],
        stock: productData.stock,
        is_active: productData.isActive,
        rating: productData.rating,
        specifications: productData.specifications || {},
        vehicle_compatibility: productData.vehicleCompatibility || []
      };

      const { data, error } = await supabase
        .from('products')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updateProduct');
    }
  }

  async deleteProduct(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Produto deletado com sucesso'
      };
    } catch (error) {
      this.handleError(error, 'deleteProduct');
    }
  }

  // ========================================
  // SERVICES - CRUD Completo
  // ========================================

  async getServices(filters: any = {}) {
    try {
      let query = supabase.from('services').select('*');

      if (filters.active !== undefined) {
        query = query.eq('is_active', filters.active === 'true' || filters.active === true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: service.base_price,
        estimatedTime: service.estimated_time,
        specifications: service.specifications || {},
        isActive: service.is_active,
        createdAt: service.created_at
      }));

      return this.formatResponse(transformedData);
    } catch (error) {
      this.handleError(error, 'getServices');
    }
  }

  async getService(id: string) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Serviço não encontrado');
      }

      const transformedData = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        basePrice: data.base_price,
        estimatedTime: data.estimated_time,
        specifications: data.specifications || {},
        isActive: data.is_active,
        createdAt: data.created_at
      };

      return this.formatResponse(transformedData);
    } catch (error) {
      this.handleError(error, 'getService');
    }
  }

  async createService(serviceData: any) {
    try {
      const supabaseData = {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category,
        base_price: serviceData.basePrice,
        estimated_time: serviceData.estimatedTime,
        specifications: serviceData.specifications || {},
        is_active: serviceData.isActive ?? true
      };

      const { data, error } = await supabase
        .from('services')
        .insert(supabaseData)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'createService');
    }
  }

  async updateService(id: string, serviceData: any) {
    try {
      const supabaseData = {
        name: serviceData.name,
        description: serviceData.description,
        category: serviceData.category,
        base_price: serviceData.basePrice,
        estimated_time: serviceData.estimatedTime,
        specifications: serviceData.specifications || {},
        is_active: serviceData.isActive
      };

      const { data, error } = await supabase
        .from('services')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updateService');
    }
  }

  async deleteService(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Serviço deletado com sucesso'
      };
    } catch (error) {
      this.handleError(error, 'deleteService');
    }
  }

  // ========================================
  // ORDERS - Para ambos os painéis
  // ========================================

  async getOrders(filters: any = {}) {
    try {
      let query = supabase.from('orders').select(`
        *,
        order_items (*)
      `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.customer) {
        query = query.or(`customer_name.ilike.%${filters.customer}%,customer_email.ilike.%${filters.customer}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return this.formatResponse(data || []);
    } catch (error) {
      this.handleError(error, 'getOrders');
    }
  }

  async createOrder(orderData: any) {
    try {
      // Gerar número único do pedido
      const orderNumber = `ORD-${Date.now()}`;
      
      // Calcular total
      const totalAmount = orderData.items.reduce((sum: number, item: any) => 
        sum + (item.unitPrice * item.quantity), 0
      );

      // Criar pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          total_amount: totalAmount,
          notes: orderData.notes
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar itens do pedido
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        type: item.type || 'product',
        item_id: item.itemId,
        item_name: item.itemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity
      }));

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (itemsError) throw itemsError;

      return this.formatResponse({
        ...order,
        items: items
      });
    } catch (error) {
      this.handleError(error, 'createOrder');
    }
  }

  // ========================================
  // CUPONS - Para painel lojista
  // ========================================

  async getCoupons(filters: any = {}) {
    try {
      let query = supabase.from('coupons').select('*');

      if (filters.active !== undefined) {
        query = query.eq('is_active', filters.active === 'true' || filters.active === true);
      }

      if (filters.type) {
        query = query.eq('discount_type', filters.type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transformar dados do Supabase (snake_case -> camelCase) para o frontend
      const transformedData = (data || []).map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minAmount: coupon.min_amount,
        maxUses: coupon.max_uses,
        usedCount: coupon.used_count,
        expiresAt: coupon.expires_at,
        isActive: coupon.is_active,
        createdAt: coupon.created_at,
        updatedAt: coupon.updated_at
      }));

      return this.formatResponse(transformedData);
    } catch (error) {
      this.handleError(error, 'getCoupons');
    }
  }

  async createCoupon(couponData: any) {
    try {
      // Transformar dados para formato Supabase (camelCase -> snake_case)
      const supabaseData = {
        code: couponData.code,
        description: couponData.description,
        discount_type: couponData.discountType,
        discount_value: couponData.discountValue,
        min_amount: couponData.minAmount,
        max_uses: couponData.maxUses,
        used_count: couponData.usedCount || 0,
        expires_at: couponData.expiresAt,
        is_active: couponData.isActive ?? true
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert(supabaseData)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'createCoupon');
    }
  }

  async updateCoupon(id: string, couponData: any) {
    try {
      // Transformar dados para formato Supabase (camelCase -> snake_case)
      const supabaseData = {
        code: couponData.code,
        description: couponData.description,
        discount_type: couponData.discountType,
        discount_value: couponData.discountValue,
        min_amount: couponData.minAmount,
        max_uses: couponData.maxUses,
        used_count: couponData.usedCount,
        expires_at: couponData.expiresAt,
        is_active: couponData.isActive
      };

      const { data, error } = await supabase
        .from('coupons')
        .update(supabaseData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updateCoupon');
    }
  }

  async deleteCoupon(id: string) {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Cupom deletado com sucesso'
      };
    } catch (error) {
      this.handleError(error, 'deleteCoupon');
    }
  }

  // ========================================
  // PROMOÇÕES - Para painel lojista
  // ========================================

  // ============================================
  // SETTINGS - Configurações do sistema
  // ============================================
  
  async getSettings(category?: string) {
    try {
      let query = supabase.from('settings').select('*');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query.order('category').order('key');
      
      if (error) throw error;
      
      return this.formatResponse(data || []);
    } catch (error) {
      this.handleError(error, 'getSettings');
    }
  }

  async getSetting(key: string) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('key', key)
        .single();
      
      if (error) throw error;
      
      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'getSetting');
    }
  }

  async updateSetting(key: string, value: string, description?: string) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({ 
          value, 
          description: description || undefined,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      
      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updateSetting');
    }
  }

  async createSetting(key: string, value: string, description?: string, category = 'general') {
    try {
      const { data, error } = await supabase
        .from('settings')
        .insert({
          key,
          value,
          description,
          category
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'createSetting');
    }
  }

  // ============================================
  // COMPANY INFO - Informações da empresa
  // ============================================

  async getCompanyInfo() {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .select('*')
        .single();
      
      if (error) throw error;
      
      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'getCompanyInfo');
    }
  }

  async updateCompanyInfo(companyData: any) {
    try {
      const { data, error } = await supabase
        .from('company_info')
        .update({
          ...companyData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updateCompanyInfo');
    }
  }

  async getPromotions(filters: any = {}) {
    try {
      let query = supabase.from('promotions').select('*');

      if (filters.active !== undefined) {
        query = query.eq('is_active', filters.active === 'true' || filters.active === true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return this.formatResponse(data || []);
    } catch (error) {
      this.handleError(error, 'getPromotions');
    }
  }

  async createPromotion(promotionData: any) {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert(promotionData)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'createPromotion');
    }
  }

  async updatePromotion(id: string, promotionData: any) {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .update(promotionData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return this.formatResponse(data);
    } catch (error) {
      this.handleError(error, 'updatePromotion');
    }
  }

  async deletePromotion(id: string) {
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        success: true,
        message: 'Promoção deletada com sucesso'
      };
    } catch (error) {
      this.handleError(error, 'deletePromotion');
    }
  }

  // ========================================
  // UTILITY METHODS - Mantém compatibilidade
  // ========================================

  formatPrice(price: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  }

  formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string) {
    return new Date(dateString).toLocaleString('pt-BR');
  }
}

// Instância singleton
const supabaseApi = new SupabaseApiService();

export default supabaseApi;

// Exports nomeados para manter compatibilidade com código existente
export const {
  healthCheck,
  getDashboardStats,
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  // Services
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  // Orders
  getOrders,
  createOrder,
  // Coupons
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  // Promotions
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  // Utilities
  formatPrice,
  formatDate,
  formatDateTime
} = supabaseApi;