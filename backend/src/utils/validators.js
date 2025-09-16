// ========================================
// SISTEMA DE VALIDAÇÕES CUSTOMIZADAS - MORIA BACKEND
// Substitui Joi por validações simples e eficientes
// ========================================

class Validator {
  constructor() {
    this.errors = [];
  }

  // Validação de string obrigatória
  required(value, fieldName) {
    if (!value || String(value).trim() === '') {
      this.errors.push(`${fieldName} é obrigatório`);
      return false;
    }
    return true;
  }

  // Validação de string com tamanho
  string(value, fieldName, { min = 0, max = Infinity } = {}) {
    const str = String(value || '').trim();
    if (str.length < min) {
      this.errors.push(`${fieldName} deve ter pelo menos ${min} caracteres`);
      return false;
    }
    if (str.length > max) {
      this.errors.push(`${fieldName} deve ter no máximo ${max} caracteres`);
      return false;
    }
    return true;
  }

  // Validação de preço flexível (string ou number)
  price(value, fieldName, { required = true } = {}) {
    if (!value && !required) return true;

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      this.errors.push(`${fieldName} deve ser um valor válido`);
      return false;
    }
    if (required && numValue <= 0) {
      this.errors.push(`${fieldName} deve ser maior que zero`);
      return false;
    }
    return true;
  }

  // Validação de inteiro
  integer(value, fieldName, { min = -Infinity, max = Infinity, required = true } = {}) {
    if (!value && !required) return true;

    const intValue = parseInt(value);
    if (isNaN(intValue)) {
      this.errors.push(`${fieldName} deve ser um número inteiro`);
      return false;
    }
    if (intValue < min || intValue > max) {
      this.errors.push(`${fieldName} deve estar entre ${min} e ${max}`);
      return false;
    }
    return true;
  }

  // Validação de boolean
  boolean(value, fieldName) {
    if (typeof value === 'boolean') return true;
    if (value === 'true' || value === 'false') return true;
    if (value === 1 || value === 0) return true;
    this.errors.push(`${fieldName} deve ser um valor booleano`);
    return false;
  }

  // Validação de URL simples
  url(value, fieldName, { required = false } = {}) {
    if (!value && !required) return true;

    const urlStr = String(value || '').trim();
    if (!urlStr && required) {
      this.errors.push(`${fieldName} é obrigatório`);
      return false;
    }

    if (urlStr) {
      try {
        new URL(urlStr);
        return true;
      } catch {
        this.errors.push(`${fieldName} deve ser uma URL válida`);
        return false;
      }
    }

    return true;
  }

  // Validação de email simples
  email(value, fieldName, { required = false } = {}) {
    if (!value && !required) return true;

    const emailStr = String(value || '').trim();
    if (!emailStr && required) {
      this.errors.push(`${fieldName} é obrigatório`);
      return false;
    }

    if (emailStr) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailStr)) {
        this.errors.push(`${fieldName} deve ser um email válido`);
        return false;
      }
    }

    return true;
  }

  // Validação de array
  array(value, fieldName, { minLength = 0, maxLength = Infinity, required = false } = {}) {
    if (!value && !required) return true;

    if (!Array.isArray(value)) {
      this.errors.push(`${fieldName} deve ser um array`);
      return false;
    }

    if (value.length < minLength) {
      this.errors.push(`${fieldName} deve ter pelo menos ${minLength} itens`);
      return false;
    }

    if (value.length > maxLength) {
      this.errors.push(`${fieldName} deve ter no máximo ${maxLength} itens`);
      return false;
    }

    return true;
  }

  // Verificar se há erros
  isValid() {
    return this.errors.length === 0;
  }

  // Obter erros
  getErrors() {
    return this.errors;
  }

  // Reset para reutilização
  reset() {
    this.errors = [];
    return this;
  }
}

// Função de validação específica para produtos
function validateProductData(data, { isUpdate = false } = {}) {
  const validator = new Validator();
  const cleanData = {};

  // Nome obrigatório
  cleanData.name = String(data.name || '').trim();
  if (!isUpdate || data.name !== undefined) {
    validator.required(cleanData.name, 'Nome');
    validator.string(cleanData.name, 'Nome', { min: 2, max: 200 });
  }

  // Categoria obrigatória
  cleanData.category = String(data.category || '').trim();
  if (!isUpdate || data.category !== undefined) {
    validator.required(cleanData.category, 'Categoria');
    validator.string(cleanData.category, 'Categoria', { min: 2, max: 50 });
  }

  // Preço obrigatório
  const priceValue = data.price;
  if (!isUpdate || priceValue !== undefined) {
    validator.price(priceValue, 'Preço', { required: !isUpdate });
    cleanData.price = parseFloat(priceValue) || 0;
  }

  // Campos opcionais de preço
  if (data.sale_price !== undefined) {
    validator.price(data.sale_price, 'Preço de venda', { required: false });
    cleanData.sale_price = parseFloat(data.sale_price) || null;
  }


  if (data.promo_price !== undefined) {
    validator.price(data.promo_price, 'Preço promocional', { required: false });
    cleanData.promo_price = parseFloat(data.promo_price) || null;
  }

  if (data.cost_price !== undefined) {
    validator.price(data.cost_price, 'Preço de custo', { required: false });
    cleanData.cost_price = parseFloat(data.cost_price) || null;
  }

  // Campos de estoque
  if (data.stock !== undefined) {
    validator.integer(data.stock, 'Estoque', { min: 0, required: false });
    cleanData.stock = parseInt(data.stock) || 0;
  }

  if (data.min_stock !== undefined) {
    validator.integer(data.min_stock, 'Estoque mínimo', { min: 0, required: false });
    cleanData.min_stock = parseInt(data.min_stock) || 0;
  }

  // Campos de texto opcionais
  cleanData.description = String(data.description || '').trim() || null;
  cleanData.subcategory = String(data.subcategory || '').trim() || null;
  cleanData.sku = String(data.sku || '').trim() || null;
  cleanData.supplier = String(data.supplier || '').trim() || null;

  // URL de imagem
  if (data.image_url !== undefined) {
    const imageUrl = String(data.image_url || '').trim();
    if (imageUrl) {
      validator.url(imageUrl, 'URL da imagem', { required: false });
    }
    cleanData.image_url = imageUrl || null;
  }

  // Boolean
  if (data.is_active !== undefined) {
    cleanData.is_active = Boolean(data.is_active);
  }

  // Arrays (JSON)
  if (data.images !== undefined) {
    validator.array(data.images, 'Imagens', { required: false });
    cleanData.images = Array.isArray(data.images) ? data.images : [];
  }

  if (data.vehicle_compatibility !== undefined) {
    validator.array(data.vehicle_compatibility, 'Compatibilidade veicular', { required: false });
    cleanData.vehicle_compatibility = Array.isArray(data.vehicle_compatibility) ? data.vehicle_compatibility : [];
  }

  // Especificações
  if (data.specifications !== undefined) {
    cleanData.specifications = typeof data.specifications === 'object' && data.specifications !== null ? data.specifications : {};
  }

  return {
    data: cleanData,
    errors: validator.getErrors(),
    isValid: validator.isValid()
  };
}

// Função de validação para usuários
function validateUserData(data, { isUpdate = false } = {}) {
  const validator = new Validator();
  const cleanData = {};

  // Nome obrigatório
  cleanData.name = String(data.name || '').trim();
  if (!isUpdate || data.name !== undefined) {
    validator.required(cleanData.name, 'Nome');
    validator.string(cleanData.name, 'Nome', { min: 2, max: 100 });
  }

  // Email obrigatório
  cleanData.email = String(data.email || '').trim().toLowerCase();
  if (!isUpdate || data.email !== undefined) {
    validator.email(cleanData.email, 'Email', { required: true });
  }

  // Senha (apenas para criação ou quando fornecida)
  if (data.password !== undefined) {
    validator.string(data.password, 'Senha', { min: 6, max: 128 });
    cleanData.password = data.password;
  } else if (!isUpdate) {
    validator.required('', 'Senha');
  }

  // Campos opcionais
  if (data.phone !== undefined) {
    cleanData.phone = String(data.phone || '').trim() || null;
  }

  if (data.cpf !== undefined) {
    cleanData.cpf = String(data.cpf || '').trim() || null;
  }

  if (data.birth_date !== undefined) {
    cleanData.birth_date = data.birth_date || null;
  }

  if (data.role !== undefined) {
    const allowedRoles = ['customer', 'admin'];
    cleanData.role = allowedRoles.includes(data.role) ? data.role : 'customer';
  }

  if (data.is_active !== undefined) {
    cleanData.is_active = Boolean(data.is_active);
  }

  return {
    data: cleanData,
    errors: validator.getErrors(),
    isValid: validator.isValid()
  };
}

// Função de validação para pedidos
function validateOrderData(data) {
  const validator = new Validator();
  const cleanData = {};

  // Dados do cliente obrigatórios
  cleanData.customer_name = String(data.customer_name || '').trim();
  validator.required(cleanData.customer_name, 'Nome do cliente');
  validator.string(cleanData.customer_name, 'Nome do cliente', { min: 2, max: 100 });

  cleanData.customer_email = String(data.customer_email || '').trim().toLowerCase();
  validator.email(cleanData.customer_email, 'Email do cliente', { required: true });

  cleanData.customer_phone = String(data.customer_phone || '').trim();
  validator.required(cleanData.customer_phone, 'Telefone do cliente');

  // Endereço obrigatório
  if (data.customer_address && typeof data.customer_address === 'object') {
    cleanData.customer_address = data.customer_address;
  } else {
    validator.required('', 'Endereço do cliente');
    cleanData.customer_address = {};
  }

  // Método de pagamento
  const allowedPaymentMethods = ['cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer'];
  cleanData.payment_method = allowedPaymentMethods.includes(data.payment_method) ? data.payment_method : null;
  if (!cleanData.payment_method) {
    validator.required('', 'Método de pagamento');
  }

  // Itens obrigatórios
  validator.array(data.items, 'Itens do pedido', { minLength: 1, required: true });
  cleanData.items = Array.isArray(data.items) ? data.items : [];

  // Campos opcionais
  cleanData.notes = String(data.notes || '').trim() || null;
  cleanData.coupon_code = String(data.coupon_code || '').trim() || null;
  cleanData.user_id = data.user_id || null;

  return {
    data: cleanData,
    errors: validator.getErrors(),
    isValid: validator.isValid()
  };
}

module.exports = {
  Validator,
  validateProductData,
  validateUserData,
  validateOrderData
};