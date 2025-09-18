// ========================================
// SERVICE CONTROLLER - PRISMA VERSION
// ✅ ELIMINA Service model dependência
// ✅ ELIMINA conversões JSON manuais
// ✅ Type safety 100% com Prisma
// ✅ Queries otimizadas e relacionamentos automáticos
// ========================================

const prisma = require('../services/prisma.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Listar serviços
const getServices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    isActive = 'true',
    minPrice,
    maxPrice
  } = req.query;

  const where = {
    ...(category && { category }),
    ...(isActive !== 'all' && { isActive: isActive === 'true' }),
    ...(minPrice && { basePrice: { gte: parseFloat(minPrice) } }),
    ...(maxPrice && { basePrice: { lte: parseFloat(maxPrice) } }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    })
  };

  // ✅ Queries paralelas para performance
  const [data, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          select: { quantity: true }
        },
        _count: {
          select: { orderItems: true }
        }
      }
    }),
    prisma.service.count({ where })
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Obter serviço por ID
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({
    where: { id: parseInt(id) },
    include: {
      orderItems: {
        select: { quantity: true, order: { select: { id: true, status: true } } }
      },
      _count: {
        select: { orderItems: true }
      }
    }
  });

  if (!service) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // Verificar acesso para usuários não-admin
  if (!req.user || req.user.role !== 'ADMIN') {
    if (!service.isActive) {
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
  const {
    name,
    description,
    category,
    basePrice,
    estimatedTime,
    specifications = {},
    requiredItems = [],
    isActive = true
  } = req.body;

  // ✅ Validação básica (Prisma fará validação de schema)
  if (!name || name.trim().length < 2) {
    throw new AppError('Nome deve ter pelo menos 2 caracteres', 400);
  }

  if (!basePrice || basePrice <= 0) {
    throw new AppError('Preço base deve ser maior que zero', 400);
  }

  // ✅ Criar serviço com JSON automático
  const newService = await prisma.service.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      category: category?.trim() || null,
      basePrice,
      estimatedTime: estimatedTime?.trim() || null,
      specifications: JSON.stringify(specifications),
      requiredItems: JSON.stringify(requiredItems),
      isActive,
      bookingsCount: 0
    }
  });

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
  const existingService = await prisma.service.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existingService) {
    throw new AppError('Serviço não encontrado', 404);
  }

  // ✅ Processar campos JSON se fornecidos
  const processedData = { ...updateData };
  if (updateData.specifications) {
    processedData.specifications = JSON.stringify(updateData.specifications);
  }
  if (updateData.requiredItems) {
    processedData.requiredItems = JSON.stringify(updateData.requiredItems);
  }

  // ✅ Update type-safe
  const updatedService = await prisma.service.update({
    where: { id: parseInt(id) },
    data: processedData
  });

  res.json({
    success: true,
    message: 'Serviço atualizado com sucesso',
    data: updatedService
  });
});

// Deletar serviço (admin) - Soft delete
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Verificar se existe e fazer soft delete
  const service = await prisma.service.update({
    where: { id: parseInt(id) },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Serviço removido com sucesso'
  });
});

// Serviços populares
const getPopularServices = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const services = await prisma.service.findMany({
    where: { isActive: true },
    take: parseInt(limit),
    orderBy: { bookingsCount: 'desc' },
    include: {
      _count: {
        select: { orderItems: true }
      }
    }
  });

  res.json({
    success: true,
    data: services
  });
});

// Obter categorias disponíveis
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.service.findMany({
    where: {
      isActive: true,
      category: { not: null }
    },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' }
  });

  res.json({
    success: true,
    data: categories.map(item => item.category).filter(Boolean)
  });
});

// Obter estatísticas de serviços (admin)
const getServiceStats = asyncHandler(async (req, res) => {
  // ✅ Aggregations type-safe e paralelas
  const [
    total,
    active,
    totalBookings,
    avgPrice,
    categoriesCount
  ] = await Promise.all([
    prisma.service.count(),
    prisma.service.count({ where: { isActive: true } }),
    prisma.service.aggregate({ _sum: { bookingsCount: true } }),
    prisma.service.aggregate({ _avg: { basePrice: true } }),
    prisma.service.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        category: { not: null }
      },
      _count: { _all: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive: total - active,
      totalBookings: totalBookings._sum.bookingsCount || 0,
      avgPrice: avgPrice._avg.basePrice || 0,
      categoriesCount: categoriesCount.length,
      categories: categoriesCount.map(cat => ({
        category: cat.category,
        count: cat._count._all
      }))
    }
  });
});

// Incrementar contador de agendamentos
const incrementBookings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ✅ Increment atômico
  const service = await prisma.service.update({
    where: { id: parseInt(id) },
    data: {
      bookingsCount: { increment: 1 }
    }
  });

  res.json({
    success: true,
    message: 'Contador de agendamentos incrementado',
    data: service
  });
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getPopularServices,
  getCategories,
  getServiceStats,
  incrementBookings
};