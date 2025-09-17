// ========================================
// ORDER CONTROLLER - PRISMA VERSION
// ✅ ELIMINA transações manuais (trx.commit/rollback)
// ✅ ELIMINA conversões JSON manuais
// ✅ ELIMINA joins manuais - relacionamentos automáticos
// ✅ ELIMINA createWithItems complexo - transação automática
// ✅ Type safety 100% com Prisma
// ========================================

const prisma = require('../services/prisma.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Helper para gerar número de pedido único
const generateOrderNumber = () => {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `MOR${timestamp}${random}`;
};

// Listar pedidos
const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    userId,
    startDate,
    endDate
  } = req.query;

  const where = {
    ...(status && { status: status.toUpperCase() }),
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }),
    // Se não for admin, só mostrar pedidos do próprio usuário
    ...(req.user.role !== 'ADMIN' ? { userId: req.user.id } : {}),
    ...(userId && req.user.role === 'ADMIN' && { userId: parseInt(userId) })
  };

  // ✅ Queries paralelas com relacionamentos automáticos
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, salePrice: true }
            },
            service: {
              select: { id: true, name: true, basePrice: true }
            }
          }
        }
      }
    }),
    prisma.order.count({ where })
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

// Obter pedido por ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          product: true,
          service: true
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Verificar acesso
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  res.json({
    success: true,
    data: order
  });
});

// Criar pedido com transação automática do Prisma
const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerWhatsapp,
    customerAddress,
    paymentMethod,
    notes,
    couponCode,
    items
  } = req.body;

  // Validar se há itens
  if (!items || items.length === 0) {
    throw new AppError('Pedido deve conter pelo menos um item', 400);
  }

  // Validar e calcular totais
  let subtotal = 0;
  let discount = 0;
  const validatedItems = [];

  // Validar itens em paralelo para performance
  const itemValidations = await Promise.all(
    items.map(async (item) => {
      let itemData;

      if (item.type === 'product') {
        itemData = await prisma.product.findUnique({
          where: { id: item.itemId }
        });
        if (!itemData || !itemData.isActive) {
          throw new AppError(`Produto ${item.itemName} não está disponível`, 400);
        }
      } else if (item.type === 'service') {
        itemData = await prisma.service.findUnique({
          where: { id: item.itemId }
        });
        if (!itemData || !itemData.isActive) {
          throw new AppError(`Serviço ${item.itemName} não está disponível`, 400);
        }
      } else {
        throw new AppError('Tipo de item inválido', 400);
      }

      // Verificar preço
      const expectedPrice = item.type === 'product'
        ? (itemData.salePrice || itemData.price)
        : itemData.basePrice;

      if (Math.abs(item.unitPrice - expectedPrice) > 0.01) {
        throw new AppError(`Preço do item ${item.itemName} foi alterado`, 400);
      }

      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;

      return {
        ...item,
        originalUnitPrice: expectedPrice,
        totalPrice: itemTotal
      };
    })
  );

  // Aplicar cupom se fornecido
  if (couponCode) {
    // TODO: Implementar validação de cupom
    if (couponCode.toUpperCase() === 'DESCONTO10') {
      discount = subtotal * 0.1;
    }
  }

  const totalAmount = subtotal - discount;

  // ✅ TRANSAÇÃO AUTOMÁTICA - Uma única operação!
  // Elimina todo o try/catch/rollback manual
  const newOrder = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName,
      customerEmail,
      customerPhone,
      customerWhatsapp,
      customerAddress: JSON.stringify(customerAddress),
      paymentMethod: paymentMethod.toUpperCase(),
      notes: notes || null,
      couponCode,
      subtotalAmount: subtotal,
      discountAmount: discount,
      totalAmount,
      status: 'PENDING',
      appliedPromotions: JSON.stringify([]),
      userId: req.user ? req.user.id : null,

      // ✅ Criar itens automaticamente na mesma transação
      items: {
        create: validatedItems.map(item => ({
          type: item.type.toUpperCase(),
          productId: item.type === 'product' ? item.itemId : null,
          serviceId: item.type === 'service' ? item.itemId : null,
          itemName: item.itemName,
          itemDescription: item.itemDescription || '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          originalUnitPrice: item.originalUnitPrice,
          appliedPromotions: JSON.stringify(item.appliedPromotions || []),
          itemSpecifications: JSON.stringify(item.itemSpecifications || {})
        }))
      }
    },
    include: {
      items: {
        include: {
          product: true,
          service: true
        }
      }
    }
  });

  // ✅ Atualizar estoque em transação separada otimizada
  const stockUpdates = validatedItems
    .filter(item => item.type === 'product')
    .map(item =>
      prisma.product.update({
        where: { id: item.itemId },
        data: {
          stock: { decrement: item.quantity },
          salesCount: { increment: item.quantity }
        }
      })
    );

  // Executar atualizações de estoque em paralelo
  if (stockUpdates.length > 0) {
    await Promise.all(stockUpdates);
  }

  // Incrementar agendamentos de serviços
  const serviceUpdates = validatedItems
    .filter(item => item.type === 'service')
    .map(item =>
      prisma.service.update({
        where: { id: item.itemId },
        data: {
          bookingsCount: { increment: 1 }
        }
      })
    );

  if (serviceUpdates.length > 0) {
    await Promise.all(serviceUpdates);
  }

  res.status(201).json({
    success: true,
    message: 'Pedido criado com sucesso',
    data: newOrder
  });
});

// Atualizar status do pedido (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  // Validar transição de status
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
  };

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) }
  });

  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  const newStatus = status.toUpperCase();
  if (!validTransitions[order.status].includes(newStatus)) {
    throw new AppError(`Não é possível alterar status de ${order.status} para ${newStatus}`, 400);
  }

  // ✅ Update simples com timestamps automáticos
  const updateData = {
    status: newStatus,
    ...(adminNotes && { adminNotes }),
    ...(newStatus === 'CONFIRMED' && { confirmedAt: new Date() }),
    ...(newStatus === 'SHIPPED' && { shippedAt: new Date() }),
    ...(newStatus === 'DELIVERED' && { deliveredAt: new Date() })
  };

  const updatedOrder = await prisma.order.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      items: {
        include: {
          product: true,
          service: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Status do pedido atualizado com sucesso',
    data: updatedOrder
  });
});

// Cancelar pedido
const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: {
        include: {
          product: true
        }
      }
    }
  });

  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Verificar acesso
  if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  // Só pode cancelar pedidos pending ou confirmed
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw new AppError('Pedido não pode ser cancelado neste status', 400);
  }

  // ✅ Estornar estoque automaticamente se necessário
  if (order.status === 'CONFIRMED') {
    const stockRestorations = order.items
      .filter(item => item.type === 'PRODUCT' && item.product)
      .map(item =>
        prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            salesCount: { decrement: item.quantity }
          }
        })
      );

    if (stockRestorations.length > 0) {
      await Promise.all(stockRestorations);
    }
  }

  const adminNotes = reason ? `Cancelado: ${reason}` : 'Pedido cancelado';

  const updatedOrder = await prisma.order.update({
    where: { id: parseInt(id) },
    data: {
      status: 'CANCELLED',
      adminNotes,
      cancelledAt: new Date()
    }
  });

  res.json({
    success: true,
    message: 'Pedido cancelado com sucesso',
    data: updatedOrder
  });
});

// Obter pedidos do usuário logado
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const userId = req.user.id;

  const where = {
    userId,
    ...(status && { status: status.toUpperCase() })
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, images: true }
            },
            service: {
              select: { id: true, name: true }
            }
          }
        }
      }
    }),
    prisma.order.count({ where })
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

// Obter estatísticas de pedidos (admin)
const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const where = {
    ...(startDate && endDate && {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    })
  };

  // ✅ Aggregations type-safe e paralelas
  const [
    totalOrders,
    totalRevenue,
    averageOrderValue,
    statusCounts
  ] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: { totalAmount: true }
    }),
    prisma.order.aggregate({
      where,
      _avg: { totalAmount: true }
    }),
    prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { _all: true }
    })
  ]);

  const statusStats = statusCounts.reduce((acc, item) => {
    acc[item.status.toLowerCase()] = item._count._all;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageOrderValue: averageOrderValue._avg.totalAmount || 0,
      pending: statusStats.pending || 0,
      confirmed: statusStats.confirmed || 0,
      delivered: statusStats.delivered || 0,
      cancelled: statusStats.cancelled || 0
    }
  });
});

// Reordenar (criar novo pedido baseado em um pedido anterior)
const reorder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const originalOrder = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: {
      items: {
        include: {
          product: true,
          service: true
        }
      }
    }
  });

  if (!originalOrder) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Verificar acesso
  if (req.user.role !== 'ADMIN' && originalOrder.userId !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  // ✅ Validar disponibilidade em paralelo
  const itemAvailability = await Promise.all(
    originalOrder.items.map(async (item) => {
      if (item.type === 'PRODUCT') {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        if (!product || !product.isActive) {
          throw new AppError(`Produto ${item.itemName} não está mais disponível`, 400);
        }
        return {
          ...item,
          currentPrice: product.salePrice || product.price
        };
      } else {
        const service = await prisma.service.findUnique({
          where: { id: item.serviceId }
        });
        if (!service || !service.isActive) {
          throw new AppError(`Serviço ${item.itemName} não está mais disponível`, 400);
        }
        return {
          ...item,
          currentPrice: service.basePrice
        };
      }
    })
  );

  // Preparar dados para novo pedido
  const newOrderData = {
    customerName: originalOrder.customerName,
    customerEmail: originalOrder.customerEmail,
    customerPhone: originalOrder.customerPhone,
    customerWhatsapp: originalOrder.customerWhatsapp,
    customerAddress: JSON.parse(originalOrder.customerAddress),
    paymentMethod: originalOrder.paymentMethod,
    notes: `Reordenação do pedido ${originalOrder.orderNumber}`,
    items: itemAvailability.map(item => ({
      type: item.type.toLowerCase(),
      itemId: item.productId || item.serviceId,
      itemName: item.itemName,
      itemDescription: item.itemDescription,
      quantity: item.quantity,
      unitPrice: item.currentPrice
    }))
  };

  // Reutilizar endpoint de criação
  req.body = newOrderData;
  return createOrder(req, res);
});

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrderStats,
  reorder
};