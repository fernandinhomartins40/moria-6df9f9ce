// ========================================
// ORDER CONTROLLER - MORIA BACKEND
// Controlador de pedidos
// ========================================

const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const Service = require('../models/Service.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Listar pedidos
const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    user_id,
    start_date,
    end_date
  } = req.query;

  const filters = {};

  // Aplicar filtros
  if (status) filters.status = status;
  if (start_date && end_date) {
    filters.start_date = start_date;
    filters.end_date = end_date;
  }

  // Se não for admin, só mostrar pedidos do próprio usuário
  if (req.user.role !== 'admin') {
    filters.user_id = req.user.id;
  } else if (user_id) {
    filters.user_id = user_id;
  }

  const result = await Order.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter pedido por ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByIdWithItems(id);
  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Se não for admin, verificar se o pedido pertence ao usuário
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  res.json({
    success: true,
    data: order
  });
});

// Criar pedido
const createOrder = asyncHandler(async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    payment_method,
    notes,
    coupon_code,
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

  for (const item of items) {
    let itemData;

    if (item.type === 'product') {
      itemData = await Product.findById(item.item_id);
      if (!itemData || !itemData.is_active) {
        throw new AppError(`Produto ${item.item_name} não está disponível`, 400);
      }
    } else if (item.type === 'service') {
      itemData = await Service.findById(item.item_id);
      if (!itemData || !itemData.is_active) {
        throw new AppError(`Serviço ${item.item_name} não está disponível`, 400);
      }
    } else {
      throw new AppError('Tipo de item inválido', 400);
    }

    // Verificar preço
    const expectedPrice = item.type === 'product'
      ? (itemData.sale_price || itemData.price)
      : itemData.base_price;

    if (Math.abs(item.unit_price - expectedPrice) > 0.01) {
      throw new AppError(`Preço do item ${item.item_name} foi alterado`, 400);
    }

    const itemTotal = item.quantity * item.unit_price;
    subtotal += itemTotal;

    validatedItems.push({
      ...item,
      original_unit_price: expectedPrice,
      total_price: itemTotal
    });
  }

  // Aplicar cupom se fornecido
  if (coupon_code) {
    // TODO: Implementar validação de cupom quando a tabela de cupons estiver pronta
    // Por enquanto, assumir desconto de 10% se cupom for "DESCONTO10"
    if (coupon_code.toUpperCase() === 'DESCONTO10') {
      discount = subtotal * 0.1;
    }
  }

  const total_amount = subtotal - discount;

  // Dados do pedido
  const orderData = {
    user_id: req.user ? req.user.id : null,
    customer_name,
    customer_email,
    customer_phone,
    customer_address: JSON.stringify(customer_address),
    payment_method,
    notes: notes || '',
    coupon_code,
    subtotal_amount: subtotal,
    discount_amount: discount,
    total_amount,
    status: 'pending',
    applied_promotions: JSON.stringify([])
  };

  // Criar pedido com itens
  const newOrder = await Order.createWithItems(orderData, validatedItems);

  // Se for produto, decrementar estoque
  for (const item of validatedItems) {
    if (item.type === 'product') {
      const product = await Product.findById(item.item_id);
      if (product.stock >= item.quantity) {
        await Product.update(item.item_id, {
          stock: product.stock - item.quantity
        });
      }
    } else if (item.type === 'service') {
      // Incrementar contador de agendamentos
      await Service.incrementBookings(item.item_id);
    }
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
  const { status, admin_notes } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Validar transição de status
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['preparing', 'cancelled'],
    'preparing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };

  if (!validTransitions[order.status].includes(status)) {
    throw new AppError(`Não é possível alterar status de ${order.status} para ${status}`, 400);
  }

  const updatedOrder = await Order.updateStatus(id, status, admin_notes);

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

  const order = await Order.findById(id);
  if (!order) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Se não for admin, verificar se o pedido pertence ao usuário
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  // Só pode cancelar pedidos pending ou confirmed
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Pedido não pode ser cancelado neste status', 400);
  }

  // Estornar estoque se necessário
  if (order.status === 'confirmed') {
    const orderWithItems = await Order.findByIdWithItems(id);

    for (const item of orderWithItems.items) {
      if (item.type === 'product') {
        const product = await Product.findById(item.item_id);
        if (product) {
          await Product.update(item.item_id, {
            stock: product.stock + item.quantity
          });
        }
      }
    }
  }

  const adminNotes = reason ? `Cancelado: ${reason}` : 'Pedido cancelado';
  const updatedOrder = await Order.updateStatus(id, 'cancelled', adminNotes);

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

  const filters = { user_id: userId };
  if (status) filters.status = status;

  const result = await Order.findWithPagination(filters, parseInt(page), parseInt(limit));

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Obter estatísticas de pedidos (admin)
const getOrderStats = asyncHandler(async (req, res) => {
  const { start_date, end_date } = req.query;

  const stats = await Order.getStats(start_date, end_date);

  res.json({
    success: true,
    data: stats
  });
});

// Reordenar (criar novo pedido baseado em um pedido anterior)
const reorder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const originalOrder = await Order.findByIdWithItems(id);
  if (!originalOrder) {
    throw new AppError('Pedido não encontrado', 404);
  }

  // Se não for admin, verificar se o pedido pertence ao usuário
  if (req.user.role !== 'admin' && originalOrder.user_id !== req.user.id) {
    throw new AppError('Acesso negado', 403);
  }

  // Validar se todos os itens ainda estão disponíveis
  const items = [];
  for (const item of originalOrder.items) {
    let itemData;

    if (item.type === 'product') {
      itemData = await Product.findById(item.item_id);
      if (!itemData || !itemData.is_active) {
        throw new AppError(`Produto ${item.item_name} não está mais disponível`, 400);
      }
    } else if (item.type === 'service') {
      itemData = await Service.findById(item.item_id);
      if (!itemData || !itemData.is_active) {
        throw new AppError(`Serviço ${item.item_name} não está mais disponível`, 400);
      }
    }

    items.push({
      type: item.type,
      item_id: item.item_id,
      item_name: item.item_name,
      item_description: item.item_description,
      quantity: item.quantity,
      unit_price: item.type === 'product'
        ? (itemData.sale_price || itemData.price)
        : itemData.base_price
    });
  }

  // Criar novo pedido
  const newOrderData = {
    customer_name: originalOrder.customer_name,
    customer_email: originalOrder.customer_email,
    customer_phone: originalOrder.customer_phone,
    customer_address: originalOrder.customer_address,
    payment_method: originalOrder.payment_method,
    notes: `Reordenação do pedido ${originalOrder.order_number}`,
    items
  };

  // Usar o endpoint de criar pedido
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