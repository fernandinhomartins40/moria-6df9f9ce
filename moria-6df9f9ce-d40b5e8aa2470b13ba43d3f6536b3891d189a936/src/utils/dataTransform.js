// ========================================
// DATA TRANSFORMATION UTILITIES
// ========================================
// Utilitários para padronizar transformação de dados
// entre frontend, backend e banco de dados

/**
 * Converte snake_case para camelCase
 * @param {Object} obj - Objeto com propriedades em snake_case
 * @returns {Object} - Objeto com propriedades em camelCase
 */
export const snakeToCamel = (obj) => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    // Converter snake_case para camelCase
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    converted[camelKey] = snakeToCamel(value);
  }

  return converted;
};

/**
 * Converte camelCase para snake_case
 * @param {Object} obj - Objeto com propriedades em camelCase
 * @returns {Object} - Objeto com propriedades em snake_case
 */
export const camelToSnake = (obj) => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(camelToSnake);
  }

  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    // Converter camelCase para snake_case
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    converted[snakeKey] = camelToSnake(value);
  }

  return converted;
};

/**
 * Transformar produto do formato do banco para frontend
 * @param {Object} dbProduct - Produto no formato do banco
 * @returns {Object} - Produto no formato do frontend
 */
export const transformProductFromDb = (dbProduct) => {
  if (!dbProduct) return null;
  
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    category: dbProduct.category,
    price: dbProduct.price,
    salePrice: dbProduct.salePrice,
    promoPrice: dbProduct.promoPrice,
    images: dbProduct.images ? JSON.parse(dbProduct.images) : [],
    stock: dbProduct.stock,
    minStock: dbProduct.minStock,
    sku: dbProduct.sku,
    brand: dbProduct.brand,
    supplier: dbProduct.supplier,
    isActive: dbProduct.isActive,
    rating: dbProduct.rating,
    specifications: dbProduct.specifications ? JSON.parse(dbProduct.specifications) : {},
    vehicleCompatibility: dbProduct.vehicleCompatibility ? JSON.parse(dbProduct.vehicleCompatibility) : [],
    createdAt: dbProduct.createdAt,
    updatedAt: dbProduct.updatedAt
  };
};

/**
 * Transformar produto do frontend para formato do banco
 * @param {Object} frontendProduct - Produto no formato do frontend
 * @returns {Object} - Produto no formato do banco
 */
export const transformProductToDb = (frontendProduct) => {
  if (!frontendProduct) return null;
  
  const dbProduct = {
    name: frontendProduct.name,
    description: frontendProduct.description,
    category: frontendProduct.category,
    price: parseFloat(frontendProduct.price),
    salePrice: frontendProduct.salePrice ? parseFloat(frontendProduct.salePrice) : null,
    promoPrice: frontendProduct.promoPrice ? parseFloat(frontendProduct.promoPrice) : null,
    stock: parseInt(frontendProduct.stock) || 0,
    minStock: parseInt(frontendProduct.minStock) || 5,
    sku: frontendProduct.sku || null,
    brand: frontendProduct.brand || null,
    supplier: frontendProduct.supplier || null,
    isActive: frontendProduct.isActive !== undefined ? frontendProduct.isActive : true,
    rating: parseFloat(frontendProduct.rating) || 0
  };

  // Converter arrays/objects para JSON strings
  if (frontendProduct.images && Array.isArray(frontendProduct.images)) {
    dbProduct.images = JSON.stringify(frontendProduct.images);
  }
  if (frontendProduct.specifications && typeof frontendProduct.specifications === 'object') {
    dbProduct.specifications = JSON.stringify(frontendProduct.specifications);
  }
  if (frontendProduct.vehicleCompatibility && Array.isArray(frontendProduct.vehicleCompatibility)) {
    dbProduct.vehicleCompatibility = JSON.stringify(frontendProduct.vehicleCompatibility);
  }

  return dbProduct;
};

/**
 * Transformar serviço do formato do banco para frontend
 * @param {Object} dbService - Serviço no formato do banco
 * @returns {Object} - Serviço no formato do frontend
 */
export const transformServiceFromDb = (dbService) => {
  if (!dbService) return null;
  
  return {
    id: dbService.id,
    name: dbService.name,
    description: dbService.description,
    category: dbService.category,
    basePrice: dbService.basePrice,
    estimatedTime: dbService.estimatedTime,
    specifications: dbService.specifications ? JSON.parse(dbService.specifications) : {},
    isActive: dbService.isActive,
    createdAt: dbService.createdAt,
    updatedAt: dbService.updatedAt
  };
};

/**
 * Transformar serviço do frontend para formato do banco
 * @param {Object} frontendService - Serviço no formato do frontend
 * @returns {Object} - Serviço no formato do banco
 */
export const transformServiceToDb = (frontendService) => {
  if (!frontendService) return null;
  
  const dbService = {
    name: frontendService.name,
    description: frontendService.description,
    category: frontendService.category,
    basePrice: frontendService.basePrice ? parseFloat(frontendService.basePrice) : null,
    estimatedTime: frontendService.estimatedTime || "60 minutos",
    isActive: frontendService.isActive !== undefined ? frontendService.isActive : true
  };

  // Converter specifications para JSON string
  if (frontendService.specifications && typeof frontendService.specifications === 'object') {
    dbService.specifications = JSON.stringify(frontendService.specifications);
  }

  return dbService;
};

/**
 * Transformar promoção do formato do banco para frontend
 * @param {Object} dbPromotion - Promoção no formato do banco
 * @returns {Object} - Promoção no formato do frontend
 */
export const transformPromotionFromDb = (dbPromotion) => {
  if (!dbPromotion) return null;
  
  return {
    id: dbPromotion.id,
    title: dbPromotion.title,
    description: dbPromotion.description,
    discountType: dbPromotion.discountType,
    discountValue: dbPromotion.discountValue,
    category: dbPromotion.category,
    minAmount: dbPromotion.minAmount,
    startDate: dbPromotion.startDate,
    endDate: dbPromotion.endDate,
    isActive: dbPromotion.isActive,
    createdAt: dbPromotion.createdAt,
    updatedAt: dbPromotion.updatedAt
  };
};

/**
 * Transformar cupom do formato do banco para frontend
 * @param {Object} dbCoupon - Cupom no formato do banco
 * @returns {Object} - Cupom no formato do frontend
 */
export const transformCouponFromDb = (dbCoupon) => {
  if (!dbCoupon) return null;
  
  return {
    id: dbCoupon.id,
    code: dbCoupon.code,
    description: dbCoupon.description,
    discountType: dbCoupon.discountType,
    discountValue: dbCoupon.discountValue,
    minAmount: dbCoupon.minAmount,
    maxUses: dbCoupon.maxUses,
    usedCount: dbCoupon.usedCount,
    expiresAt: dbCoupon.expiresAt,
    isActive: dbCoupon.isActive,
    createdAt: dbCoupon.createdAt,
    updatedAt: dbCoupon.updatedAt
  };
};

/**
 * Transformar pedido do formato do banco para frontend
 * @param {Object} dbOrder - Pedido no formato do banco
 * @returns {Object} - Pedido no formato do frontend
 */
export const transformOrderFromDb = (dbOrder) => {
  if (!dbOrder) return null;
  
  return {
    id: dbOrder.id,
    orderNumber: dbOrder.orderNumber,
    customerName: dbOrder.customerName,
    customerEmail: dbOrder.customerEmail,
    customerPhone: dbOrder.customerPhone,
    customerAddress: dbOrder.customerAddress,
    status: dbOrder.status,
    totalAmount: dbOrder.totalAmount,
    notes: dbOrder.notes,
    items: dbOrder.items || [],
    createdAt: dbOrder.createdAt,
    updatedAt: dbOrder.updatedAt
  };
};

/**
 * Utilitários de formatação
 */
export const formatters = {
  /**
   * Formatar preço em Real brasileiro
   */
  price: (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  },

  /**
   * Formatar data para pt-BR
   */
  date: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  },

  /**
   * Formatar data e hora para pt-BR
   */
  datetime: (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR');
  },

  /**
   * Formatar percentual
   */
  percentage: (value) => {
    return `${(value || 0).toFixed(1)}%`;
  },

  /**
   * Formatar status do pedido
   */
  orderStatus: (status) => {
    const statusMap = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'processing': 'Processando',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  },

  /**
   * Formatar tipo de desconto
   */
  discountType: (type) => {
    const typeMap = {
      'percentage': 'Percentual',
      'fixed_amount': 'Valor Fixo'
    };
    return typeMap[type] || type;
  }
};

/**
 * Validadores
 */
export const validators = {
  /**
   * Validar formato de email
   */
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar código do cupom
   */
  couponCode: (code) => {
    return code && code.length >= 3 && /^[A-Z0-9]+$/.test(code);
  },

  /**
   * Validar preço
   */
  price: (price) => {
    return !isNaN(price) && parseFloat(price) > 0;
  },

  /**
   * Validar SKU
   */
  sku: (sku) => {
    return !sku || /^[A-Z0-9-_]+$/i.test(sku);
  }
};

// Export default com todas as utilidades
export default {
  snakeToCamel,
  camelToSnake,
  transformProductFromDb,
  transformProductToDb,
  transformServiceFromDb,
  transformServiceToDb,
  transformPromotionFromDb,
  transformCouponFromDb,
  transformOrderFromDb,
  formatters,
  validators
};