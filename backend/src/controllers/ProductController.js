// ========================================
// PRODUCT CONTROLLER - MORIA BACKEND
// Controlador de produtos
// ========================================

const Product = require('../models/Product.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');
const { validateProductData } = require('../utils/validators.js');

// Listar produtos
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    subcategory,
    supplier,
    min_price,
    max_price,
    search,
    is_active = 'true',
    on_sale
  } = req.query;

  const filters = {};

  // Aplicar filtros
  if (category) filters.category = category;
  if (subcategory) filters.subcategory = subcategory;
  if (supplier) filters.supplier = supplier;
  if (is_active !== 'all') filters.is_active = is_active === 'true';
  if (on_sale === 'true') filters.on_sale = true;

  // Filtros de preço
  if (min_price) filters.min_price = parseFloat(min_price);
  if (max_price) filters.max_price = parseFloat(max_price);

  // Busca por texto
  if (search) filters.search = search;

  const result = await Product.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter produto por ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Se usuário não for admin, só mostrar produtos ativos
  if (!req.user || req.user.role !== 'admin') {
    if (!product.is_active) {
      throw new AppError('Produto não encontrado', 404);
    }
  }

  res.json({
    success: true,
    data: product
  });
});

// Criar produto (admin)
const createProduct = asyncHandler(async (req, res) => {
  // Validar dados de entrada com sistema customizado
  const validation = validateProductData(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: validation.errors
    });
  }

  const productData = validation.data;

  // Verificar se SKU já existe (se fornecido)
  if (productData.sku) {
    const existingProduct = await Product.findBySku(productData.sku);
    if (existingProduct) {
      throw new AppError('SKU já existe no sistema', 409);
    }
  }

  const newProduct = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Produto criado com sucesso',
    data: newProduct
  });
});

// Atualizar produto (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID do produto inválido'
    });
  }

  // Validar dados de entrada com sistema customizado (para update)
  const validation = validateProductData(req.body, { isUpdate: true });

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: validation.errors
    });
  }

  const updateData = validation.data;

  // Verificar se produto existe
  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Verificar SKU duplicado (se está sendo alterado)
  if (updateData.sku && updateData.sku !== product.sku) {
    const existingProduct = await Product.findBySku(updateData.sku);
    if (existingProduct) {
      throw new AppError('SKU já existe no sistema', 409);
    }
  }

  const updatedProduct = await Product.update(id, updateData);

  res.json({
    success: true,
    message: 'Produto atualizado com sucesso',
    data: updatedProduct
  });
});

// Deletar produto (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Soft delete - apenas marcar como inativo
  await Product.update(id, { is_active: false });

  res.json({
    success: true,
    message: 'Produto removido com sucesso'
  });
});

// Produtos populares
const getPopularProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findPopular(parseInt(limit));

  res.json({
    success: true,
    data: products
  });
});

// Produtos em promoção
const getProductsOnSale = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const filters = { on_sale: true, is_active: true };
  const result = await Product.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Produtos por categoria
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await Product.findByCategory(category, { page: parseInt(page), limit: parseInt(limit) });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Buscar produtos
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError('Termo de busca deve ter pelo menos 2 caracteres', 400);
  }

  const filters = { search: q.trim(), is_active: true };
  const result = await Product.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    searchTerm: q.trim()
  });
});

// Obter categorias disponíveis
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.getCategories();

  res.json({
    success: true,
    data: categories
  });
});

// Obter estatísticas de produtos (admin)
const getProductStats = asyncHandler(async (req, res) => {
  const stats = await Product.getStats();

  res.json({
    success: true,
    data: stats
  });
});

// Atualizar estoque (admin)
const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stock, operation = 'set' } = req.body;

  if (!['set', 'add', 'subtract'].includes(operation)) {
    throw new AppError('Operação deve ser: set, add ou subtract', 400);
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  let newStock = stock;
  if (operation === 'add') {
    newStock = product.stock + stock;
  } else if (operation === 'subtract') {
    newStock = product.stock - stock;
  }

  if (newStock < 0) {
    throw new AppError('Estoque não pode ser negativo', 400);
  }

  const updatedProduct = await Product.update(id, { stock: newStock });

  res.json({
    success: true,
    message: 'Estoque atualizado com sucesso',
    data: {
      product: updatedProduct,
      previousStock: product.stock,
      newStock: newStock,
      operation
    }
  });
});

// Listar favoritos do usuário
const getFavorites = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado', 401);
  }

  const favorites = await Product.getFavoritesByUser(userId);

  res.json({
    success: true,
    data: favorites
  });
});

// Adicionar produto aos favoritos
const addToFavorites = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado', 401);
  }

  // Verificar se produto existe
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Produto não encontrado', 404);
  }

  // Verificar se já está nos favoritos
  const existingFavorite = await Product.isFavorite(userId, productId);
  if (existingFavorite) {
    throw new AppError('Produto já está nos favoritos', 409);
  }

  await Product.addToFavorites(userId, productId);

  res.json({
    success: true,
    message: 'Produto adicionado aos favoritos',
    data: { productId, userId }
  });
});

// Remover produto dos favoritos
const removeFromFavorites = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('Usuário não autenticado', 401);
  }

  // Verificar se está nos favoritos
  const existingFavorite = await Product.isFavorite(userId, productId);
  if (!existingFavorite) {
    throw new AppError('Produto não está nos favoritos', 404);
  }

  await Product.removeFromFavorites(userId, productId);

  res.json({
    success: true,
    message: 'Produto removido dos favoritos',
    data: { productId, userId }
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPopularProducts,
  getProductsOnSale,
  getProductsByCategory,
  searchProducts,
  getCategories,
  getProductStats,
  updateStock,
  getFavorites,
  addToFavorites,
  removeFromFavorites
};