// ========================================
// VALIDAÇÕES JOI - MORIA BACKEND
// Schemas de validação para todas as entidades
// ========================================

const Joi = require('joi');

// Schema base para IDs
const idSchema = Joi.alternatives().try(
  Joi.number().integer().positive(),
  Joi.string().pattern(/^\d+$/).custom((value, helpers) => {
    const num = parseInt(value, 10);
    if (num <= 0) return helpers.error('any.invalid');
    return num;
  })
).required();

// Schema para datas
const dateSchema = Joi.date().iso();

// Validações de Usuário
const userValidation = {
  create: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    }),
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional().messages({
      'string.pattern.base': 'Telefone deve ter o formato (XX) XXXXX-XXXX'
    }),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional().messages({
      'string.pattern.base': 'CPF deve ter o formato XXX.XXX.XXX-XX'
    }),
    birth_date: dateSchema.optional(),
    role: Joi.string().valid('customer', 'admin').default('customer')
  }),

  update: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).optional(),
    cpf: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/).optional(),
    birth_date: dateSchema.optional(),
    role: Joi.string().valid('customer', 'admin').optional(),
    is_active: Joi.boolean().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

// Validações de Produto
const productValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).allow('').optional(),
    category: Joi.string().min(2).max(50).required(),
    subcategory: Joi.string().min(2).max(50).allow('').optional(),
    price: Joi.number().positive().precision(2).required(),
    sale_price: Joi.number().min(0).precision(2).allow(null).optional(),
    promo_price: Joi.number().min(0).precision(2).allow(null).optional(),
    cost_price: Joi.number().min(0).precision(2).allow(null).optional(),
    images: Joi.array().items(Joi.string().allow('')).default([]),
    stock: Joi.number().integer().min(0).default(0),
    min_stock: Joi.number().integer().min(0).default(0),
    sku: Joi.string().max(50).allow('').optional(),
    supplier: Joi.string().max(100).allow('').optional(),
    is_active: Joi.boolean().default(true),
    specifications: Joi.object().default({}),
    vehicle_compatibility: Joi.array().items(Joi.string()).default([])
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).allow('').optional(),
    category: Joi.string().min(2).max(50).optional(),
    subcategory: Joi.string().min(2).max(50).allow('').optional(),
    price: Joi.number().positive().precision(2).optional(),
    sale_price: Joi.number().min(0).precision(2).allow(null).optional(),
    promo_price: Joi.number().min(0).precision(2).allow(null).optional(),
    cost_price: Joi.number().min(0).precision(2).allow(null).optional(),
    images: Joi.array().items(Joi.string().allow('')).optional(),
    stock: Joi.number().integer().min(0).optional(),
    min_stock: Joi.number().integer().min(0).optional(),
    sku: Joi.string().max(50).allow('').optional(),
    supplier: Joi.string().max(100).allow('').optional(),
    is_active: Joi.boolean().optional(),
    specifications: Joi.object().optional(),
    vehicle_compatibility: Joi.array().items(Joi.string()).optional()
  })
};

// Validações de Serviço
const serviceValidation = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().min(2).max(50).required(),
    base_price: Joi.number().positive().precision(2).required(),
    estimated_time: Joi.string().max(50).optional(),
    specifications: Joi.object().default({}),
    is_active: Joi.boolean().default(true),
    required_items: Joi.array().items(Joi.number().integer()).default([]),
    instructions: Joi.string().max(500).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    category: Joi.string().min(2).max(50).optional(),
    base_price: Joi.number().positive().precision(2).optional(),
    estimated_time: Joi.string().max(50).optional(),
    specifications: Joi.object().optional(),
    is_active: Joi.boolean().optional(),
    required_items: Joi.array().items(Joi.number().integer()).optional(),
    instructions: Joi.string().max(500).optional()
  })
};

// Validações de Pedido
const orderValidation = {
  create: Joi.object({
    user_id: Joi.number().integer().positive().optional(),
    customer_name: Joi.string().min(2).max(100).required(),
    customer_email: Joi.string().email().required(),
    customer_phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
    customer_address: Joi.object({
      street: Joi.string().required(),
      number: Joi.string().required(),
      complement: Joi.string().optional(),
      neighborhood: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().length(2).required(),
      zip_code: Joi.string().pattern(/^\d{5}-?\d{3}$/).required()
    }).required(),
    payment_method: Joi.string().valid('cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer').required(),
    notes: Joi.string().max(500).optional(),
    coupon_code: Joi.string().max(20).optional(),
    items: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('product', 'service').required(),
        item_id: Joi.number().integer().positive().required(),
        item_name: Joi.string().required(),
        item_description: Joi.string().optional(),
        quantity: Joi.number().integer().positive().required(),
        unit_price: Joi.number().positive().precision(2).required(),
        original_unit_price: Joi.number().positive().precision(2).optional(),
        applied_promotions: Joi.array().default([]),
        item_specifications: Joi.object().default({})
      })
    ).min(1).required()
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled').required(),
    admin_notes: Joi.string().max(500).optional()
  })
};

// Validações de Endereço
const addressValidation = {
  create: Joi.object({
    user_id: Joi.number().integer().positive().required(),
    type: Joi.string().valid('home', 'work', 'other').default('home'),
    street: Joi.string().min(5).max(200).required(),
    number: Joi.string().min(1).max(20).required(),
    complement: Joi.string().max(100).optional(),
    neighborhood: Joi.string().min(2).max(100).required(),
    city: Joi.string().min(2).max(100).required(),
    state: Joi.string().length(2).required(),
    zip_code: Joi.string().pattern(/^\d{5}-?\d{3}$/).required(),
    is_default: Joi.boolean().default(false)
  }),

  update: Joi.object({
    type: Joi.string().valid('home', 'work', 'other').optional(),
    street: Joi.string().min(5).max(200).optional(),
    number: Joi.string().min(1).max(20).optional(),
    complement: Joi.string().max(100).optional(),
    neighborhood: Joi.string().min(2).max(100).optional(),
    city: Joi.string().min(2).max(100).optional(),
    state: Joi.string().length(2).optional(),
    zip_code: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
    is_default: Joi.boolean().optional()
  })
};

// Validações de Filtros/Query Parameters
const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(10)
  }),

  productFilters: Joi.object({
    category: Joi.string().optional(),
    subcategory: Joi.string().optional(),
    supplier: Joi.string().optional(),
    min_price: Joi.number().positive().optional(),
    max_price: Joi.number().positive().optional(),
    search: Joi.string().max(100).optional(),
    is_active: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string().valid('all', 'true', 'false')
    ).optional(),
    on_sale: Joi.boolean().optional()
  }),

  serviceFilters: Joi.object({
    category: Joi.string().optional(),
    search: Joi.string().max(100).optional(),
    is_active: Joi.alternatives().try(
      Joi.boolean(),
      Joi.string().valid('all', 'true', 'false')
    ).optional(),
    min_price: Joi.number().positive().optional(),
    max_price: Joi.number().positive().optional()
  }),

  orderFilters: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled').optional(),
    user_id: Joi.number().integer().positive().optional(),
    start_date: dateSchema.optional(),
    end_date: dateSchema.optional()
  })
};

// Middleware de validação
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      // Log detalhado para debug
      console.error('❌ Erro de validação:', {
        property,
        originalData: data,
        errors: errors
      });

      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors
      });
    }

    // Substituir os dados validados
    req[property] = value;
    next();
  };
};

module.exports = {
  // Schemas
  userValidation,
  productValidation,
  serviceValidation,
  orderValidation,
  addressValidation,
  queryValidation,
  idSchema,

  // Middleware
  validate
};