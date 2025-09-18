// ========================================
// VALIDADORES COM ZOD - MORIA BACKEND
// Exemplos de validação de dados de entrada
// ========================================

const { z } = require('zod');

// Validador para criação de produto
const createProductSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  price: z.number().positive('Preço deve ser maior que zero'),
  salePrice: z.number().optional(),
  promoPrice: z.number().optional(),
  costPrice: z.number().optional(),
  stock: z.number().int().nonnegative().default(0),
  minStock: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  supplier: z.string().optional(),
  images: z.array(z.string()).optional().default([]),
  specifications: z.record(z.string()).optional().default({}),
  vehicleCompatibility: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true)
});

// Validador para atualização de produto
const updateProductSchema = createProductSchema.partial();

// Validador para criação de serviço
const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  category: z.string().optional(),
  basePrice: z.number().positive('Preço base deve ser maior que zero'),
  estimatedTime: z.string().optional(),
  specifications: z.record(z.string()).optional().default({}),
  requiredItems: z.array(z.string()).optional().default([]),
  isActive: z.boolean().default(true)
});

// Validador para atualização de serviço
const updateServiceSchema = createServiceSchema.partial();

// Validador para registro de usuário
const registerUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  birthDate: z.string().optional() // ISO date string
});

// Validador para login
const loginUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
});

// Validador para criação de pedido
const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Nome do cliente deve ter pelo menos 2 caracteres'),
  customerEmail: z.string().email('Email inválido'),
  customerPhone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  customerWhatsapp: z.string().optional(),
  customerAddress: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string()
  }),
  paymentMethod: z.enum(['CASH', 'PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER']),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  items: z.array(z.object({
    type: z.enum(['product', 'service']),
    itemId: z.number().int().positive(),
    itemName: z.string(),
    itemDescription: z.string().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative()
  })).min(1, 'Pedido deve conter pelo menos um item')
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  createServiceSchema,
  updateServiceSchema,
  registerUserSchema,
  loginUserSchema,
  createOrderSchema
};