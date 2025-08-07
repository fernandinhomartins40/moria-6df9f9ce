const express = require('express');
const router = express.Router();

// ========================================
// DADOS MOCK - Em memória (Single Tenant)
// ========================================

// Mock data para demonstração - Dados automotivos reais
let products = [
  {
    id: 1,
    name: 'Filtro de Óleo Mann W75/3',
    description: 'Filtro de óleo de alta qualidade para motores 1.0, 1.4 e 1.6',
    category: 'Filtros',
    price: 25.90,
    stock: 45,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Pastilha de Freio Dianteira Cobreq',
    description: 'Pastilha de freio dianteira com cerâmica para maior durabilidade',
    category: 'Freios',
    price: 139.90,
    stock: 12,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Amortecedor Traseiro Monroe',
    description: 'Amortecedor traseiro Monroe Gas-Matic para maior conforto',
    category: 'Suspensão',
    price: 189.90,
    stock: 8,
    active: true,
    createdAt: new Date().toISOString()
  }
];

let orders = [
  {
    id: 1001,
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '(11) 99999-9999',
    items: [
      { productId: 1, productName: 'Filtro de Óleo Mann W75/3', quantity: 1, price: 25.90 }
    ],
    total: 25.90,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let services = [
  {
    id: 501,
    name: 'Troca de Óleo',
    description: 'Troca de óleo completa com filtro de alta qualidade',
    estimatedTime: '30 minutos',
    price: 80.00,
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Helper functions
const generateId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// ========================================
// PRODUCTS ROUTES
// ========================================

// GET /api/products - Listar todos os produtos
router.get('/products', (req, res) => {
  try {
    const { category, active, search } = req.query;
    let filteredProducts = [...products];

    // Filtros simples
    if (category) {
      filteredProducts = filteredProducts.filter(p => 
        p.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (active !== undefined) {
      filteredProducts = filteredProducts.filter(p => 
        p.active === (active === 'true')
      );
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredProducts,
      total: filteredProducts.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/products/:id - Buscar produto específico
router.get('/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/products - Criar novo produto
router.post('/products', (req, res) => {
  try {
    const { name, description, category, price, stock, active = true } = req.body;

    // Validação básica
    if (!name || !description || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, description, category, price'
      });
    }

    const newProduct = {
      id: generateId(products),
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      active: Boolean(active),
      createdAt: new Date().toISOString()
    };

    products.push(newProduct);

    res.status(201).json({ 
      success: true, 
      data: newProduct,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/products/:id - Atualizar produto
router.put('/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    const updatedProduct = {
      ...products[productIndex],
      ...req.body,
      id, // Não permitir alteração do ID
      updatedAt: new Date().toISOString()
    };

    products[productIndex] = updatedProduct;

    res.json({ 
      success: true, 
      data: updatedProduct,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/products/:id - Deletar produto
router.delete('/products/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'Produto não encontrado' 
      });
    }

    products.splice(productIndex, 1);

    res.json({ 
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// ORDERS ROUTES
// ========================================

// GET /api/orders - Listar pedidos
router.get('/orders', (req, res) => {
  try {
    const { status, customer } = req.query;
    let filteredOrders = [...orders];

    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    if (customer) {
      filteredOrders = filteredOrders.filter(o =>
        o.customerName.toLowerCase().includes(customer.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredOrders,
      total: filteredOrders.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Criar pedido
router.post('/orders', (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items } = req.body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: customerName, items (array não vazio)'
      });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
      id: generateId(orders),
      customerName,
      customerEmail,
      customerPhone,
      items,
      total,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// SERVICES ROUTES
// ========================================

// GET /api/services - Listar serviços
router.get('/services', (req, res) => {
  try {
    const { active } = req.query;
    let filteredServices = [...services];

    if (active !== undefined) {
      filteredServices = filteredServices.filter(s => 
        s.active === (active === 'true')
      );
    }

    res.json({
      success: true,
      data: filteredServices,
      total: filteredServices.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// DASHBOARD/STATS ROUTES
// ========================================

// GET /api/dashboard/stats - Estatísticas gerais
router.get('/dashboard/stats', (req, res) => {
  try {
    const stats = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.active).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalServices: services.length,
      activeServices: services.filter(s => s.active).length,
      totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
      averageTicket: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

// GET /api/health - Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;