// ========================================
// SERVICE CONTROLLER - MORIA BACKEND
// Controlador de serviços
// ========================================

const Service = require('../models/Service.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Listar serviços
const getServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    is_active = 'true',
    min_price,
    max_price
  } = req.query;

  const filters = {};

  // Aplicar filtros
  if (category) filters.category = category;
  if (is_active !== 'all') filters.is_active = is_active === 'true';
  if (search) filters.search = search;

  // Filtros de preço
  if (min_price) filters.min_price = parseFloat(min_price);
  if (max_price) filters.max_price = parseFloat(max_price);

  const result = await Service.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter serviço por ID
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // Se usuário não for admin, só mostrar serviços ativos
  if (!req.user || req.user.role !== 'admin') {
    if (!service.is_active) {
      throw new AppError('Serviço não encontrado', 404);
    }
  }

  res.json({
    success: true,
    data: service
  });
});

// Criar serviço (admin)
const createService = asyncHandler(async (req, res) => {
  const serviceData = req.body;

  const newService = await Service.create(serviceData);

  res.status(201).json({
    success: true,
    message: 'Serviço criado com sucesso',
    data: newService
  });
});

// Atualizar serviço (admin)
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Verificar se serviço existe
  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  const updatedService = await Service.update(id, updateData);

  res.json({
    success: true,
    message: 'Serviço atualizado com sucesso',
    data: updatedService
  });
});

// Deletar serviço (admin)
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // Soft delete - apenas marcar como inativo
  await Service.update(id, { is_active: false });

  res.json({
    success: true,
    message: 'Serviço removido com sucesso'
  });
});

// Serviços populares
const getPopularServices = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const services = await Service.findPopular(parseInt(limit));

  res.json({
    success: true,
    data: services
  });
});

// Serviços por categoria
const getServicesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const result = await Service.findByCategory(category, { page: parseInt(page), limit: parseInt(limit) });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Buscar serviços
const searchServices = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError('Termo de busca deve ter pelo menos 2 caracteres', 400);
  }

  const filters = { search: q.trim(), is_active: true };
  const result = await Service.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
    searchTerm: q.trim()
  });
});

// Obter categorias de serviços
const getServiceCategories = asyncHandler(async (req, res) => {
  const categories = await Service.getCategories();

  res.json({
    success: true,
    data: categories
  });
});

// Incrementar contador de agendamentos
const incrementBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id);
  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  if (!service.is_active) {
    throw new AppError('Serviço não está disponível', 400);
  }

  const updatedService = await Service.incrementBookings(id);

  res.json({
    success: true,
    message: 'Agendamento registrado com sucesso',
    data: updatedService
  });
});

// Obter estatísticas de serviços (admin)
const getServiceStats = asyncHandler(async (req, res) => {
  const stats = await Service.getStats();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getPopularServices,
  getServicesByCategory,
  searchServices,
  getServiceCategories,
  incrementBookings,
  getServiceStats
};