// ========================================
// VALIDAÇÃO DE PARÂMETROS SIMPLES - MORIA BACKEND
// Validações básicas para parâmetros de rota e query
// ========================================

// Validação simples de ID
function validateId(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'ID é obrigatório'
    });
  }

  const numericId = parseInt(id);
  if (isNaN(numericId) || numericId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID deve ser um número inteiro positivo'
    });
  }

  // Adicionar ID validado ao request
  req.validatedId = numericId;
  next();
}

// Validação de paginação
function validatePagination(req, res, next) {
  let { page, limit } = req.query;

  // Valores padrão
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  // Ajustar limites
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // Máximo de 100 itens por página

  // Adicionar paginação validada ao request
  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
}

// Validação de filtros de produto
function validateProductFilters(req, res, next) {
  const {
    category,
    subcategory,
    supplier,
    min_price,
    max_price,
    search,
    is_active,
    on_sale
  } = req.query;

  const filters = {};

  // Filtros de texto (sanitização básica)
  if (category) {
    filters.category = String(category).trim();
  }

  if (subcategory) {
    filters.subcategory = String(subcategory).trim();
  }

  if (supplier) {
    filters.supplier = String(supplier).trim();
  }

  if (search) {
    const searchTerm = String(search).trim();
    if (searchTerm.length >= 2) { // Mínimo 2 caracteres para busca
      filters.search = searchTerm;
    }
  }

  // Filtros de preço
  if (min_price) {
    const minPrice = parseFloat(min_price);
    if (!isNaN(minPrice) && minPrice >= 0) {
      filters.min_price = minPrice;
    }
  }

  if (max_price) {
    const maxPrice = parseFloat(max_price);
    if (!isNaN(maxPrice) && maxPrice >= 0) {
      filters.max_price = maxPrice;
    }
  }

  // Filtros boolean
  if (is_active !== undefined) {
    if (is_active === 'all') {
      // Sem filtro de ativo
    } else {
      filters.is_active = is_active === 'true';
    }
  } else {
    filters.is_active = true; // Padrão: apenas produtos ativos
  }

  if (on_sale !== undefined) {
    filters.on_sale = on_sale === 'true';
  }

  // Adicionar filtros validados ao request
  req.filters = filters;
  next();
}

// Validação de parâmetros de busca
function validateSearchParams(req, res, next) {
  const { q, query } = req.query;
  const searchTerm = String(q || query || '').trim();

  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Termo de busca é obrigatório'
    });
  }

  if (searchTerm.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Termo de busca deve ter pelo menos 2 caracteres'
    });
  }

  if (searchTerm.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Termo de busca deve ter no máximo 100 caracteres'
    });
  }

  req.searchTerm = searchTerm;
  next();
}

// Validação de categoria (URL param)
function validateCategory(req, res, next) {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({
      success: false,
      message: 'Categoria é obrigatória'
    });
  }

  const categoryStr = String(category).trim();
  if (categoryStr.length < 2 || categoryStr.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Categoria deve ter entre 2 e 50 caracteres'
    });
  }

  req.validatedCategory = categoryStr;
  next();
}

// Validação de dados de estoque
function validateStockData(req, res, next) {
  const { stock, operation } = req.body;

  // Validar estoque
  const stockValue = parseInt(stock);
  if (isNaN(stockValue) || stockValue < 0) {
    return res.status(400).json({
      success: false,
      message: 'Estoque deve ser um número inteiro não-negativo'
    });
  }

  // Validar operação
  const allowedOperations = ['set', 'add', 'subtract'];
  const op = operation || 'set';
  if (!allowedOperations.includes(op)) {
    return res.status(400).json({
      success: false,
      message: `Operação deve ser uma de: ${allowedOperations.join(', ')}`
    });
  }

  req.stockData = {
    stock: stockValue,
    operation: op
  };

  next();
}

// Validação de dados de ordem (sorting)
function validateSortParams(req, res, next) {
  const { sort, order } = req.query;

  const allowedSortFields = [
    'id', 'name', 'category', 'price', 'stock',
    'created_at', 'updated_at', 'rating', 'sales_count'
  ];

  const allowedOrders = ['asc', 'desc'];

  let sortField = 'created_at'; // Padrão
  let sortOrder = 'desc'; // Padrão

  if (sort && allowedSortFields.includes(sort)) {
    sortField = sort;
  }

  if (order && allowedOrders.includes(order.toLowerCase())) {
    sortOrder = order.toLowerCase();
  }

  req.sorting = {
    field: sortField,
    order: sortOrder
  };

  next();
}

// Validação de upload de arquivos (básica)
function validateFileUpload(req, res, next) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum arquivo foi enviado'
    });
  }

  const file = req.files.image || req.files.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo de imagem é obrigatório'
    });
  }

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF'
    });
  }

  // Validar tamanho (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Máximo 5MB'
    });
  }

  req.validatedFile = file;
  next();
}

module.exports = {
  validateId,
  validatePagination,
  validateProductFilters,
  validateSearchParams,
  validateCategory,
  validateStockData,
  validateSortParams,
  validateFileUpload
};