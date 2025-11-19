import { prisma } from '../../config/database.js';
import { CustomerLevel, CustomerStatus, OrderStatus, Prisma, Customer } from '@prisma/client';

// ==================== TYPES ====================

interface OrderItemWithRelations {
  id: string;
  orderId: string;
  productId: string | null;
  serviceId: string | null;
  quantity: number;
  price: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  type: string;
  name: string;
  priceQuoted: boolean;
  quotedPrice: Prisma.Decimal | null;
  quotedAt: Date | null;
  createdAt: Date;
}

interface OrderWithRelations {
  id: string;
  customerId: string;
  addressId: string;
  subtotal: Prisma.Decimal;
  shippingCost?: Prisma.Decimal;
  total: Prisma.Decimal;
  status: string;
  paymentMethod: string;
  couponId?: string | null;
  discountAmount: Prisma.Decimal;
  hasProducts: boolean;
  hasServices: boolean;
  quoteStatus: string | null;
  quotedAt: Date | null;
  quoteApprovedAt: Date | null;
  quoteNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  items: OrderItemWithRelations[];
}

// ==================== SERVICE ====================

export class AdminService {
  // ==================== DASHBOARD ====================

  async getDashboardStats() {
    const [
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      totalCustomers,
      activeProducts,
      lowStockProducts,
      activeCoupons
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: [OrderStatus.DELIVERED] } }
      }),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: { in: [OrderStatus.DELIVERED] } } }),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      // Fix: Use raw query for comparing with another column
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM "products"
        WHERE stock <= "minStock"
      `.then((result: Array<{ count: bigint }>) => Number(result[0].count)),
      prisma.coupon.count({ where: { isActive: true } })
    ]);

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true } },
        items: true
      }
    }) as unknown as OrderWithRelations[];

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      pendingOrders,
      completedOrders,
      totalCustomers,
      activeProducts,
      lowStockProducts,
      activeCoupons,
      recentOrders: recentOrders.map((order: OrderWithRelations) => this.mapOrderToResponse(order))
    };
  }

  // ==================== ORDERS ====================

  async getOrders(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true } },
          items: true
        }
      }) as unknown as Promise<OrderWithRelations[]>,
      prisma.order.count({ where })
    ]);

    return {
      orders: orders.map((order: OrderWithRelations) => ({
        ...this.mapOrderToResponse(order),
        updatedAt: order.updatedAt.toISOString()
      })),
      totalCount
    };
  }

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true } },
        items: true
      }
    }) as unknown as OrderWithRelations | null;

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    return {
      ...this.mapOrderToResponse(order),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        customer: { select: { name: true, phone: true } },
        items: true
      }
    }) as unknown as OrderWithRelations;

    return {
      ...this.mapOrderToResponse(order),
      updatedAt: order.updatedAt.toISOString()
    };
  }

  // ==================== CUSTOMERS ====================

  async getCustomers(params: {
    page: number;
    limit: number;
    search?: string;
    level?: string;
    status?: string;
  }) {
    const { page, limit, search, level, status } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {};

    if (level) {
      where.level = level as CustomerLevel;
    }

    if (status) {
      where.status = status as CustomerStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { cpf: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers: customers.map((customer: Customer) => this.mapCustomerToResponse(customer)),
      totalCount
    };
  }

  async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    return this.mapCustomerToResponse(customer);
  }

  async updateCustomerLevel(id: string, level: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { level: level as CustomerLevel }
    });

    return this.mapCustomerToResponse(customer);
  }

  async updateCustomerStatus(id: string, status: string) {
    const customer = await prisma.customer.update({
      where: { id },
      data: { status: status as CustomerStatus }
    });

    return this.mapCustomerToResponse(customer);
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
  }) {
    // Verificar se já existe cliente com mesmo email ou CPF
    if (data.email) {
      const existingByEmail = await prisma.customer.findUnique({
        where: { email: data.email }
      });
      if (existingByEmail) {
        throw new Error('Já existe um cliente com este email');
      }
    }

    if (data.cpf) {
      const existingByCpf = await prisma.customer.findFirst({
        where: { cpf: data.cpf }
      });
      if (existingByCpf) {
        throw new Error('Já existe um cliente com este CPF');
      }
    }

    // Criar cliente sem senha (provisional user)
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf || null,
        password: '', // Cliente criado pelo admin não tem senha inicialmente
        level: CustomerLevel.BRONZE,
        status: CustomerStatus.ACTIVE,
      }
    });

    return this.mapCustomerToResponse(customer);
  }

  // ==================== CUSTOMER VEHICLES ====================

  async getCustomerVehicles(customerId: string) {
    const vehicles = await prisma.customerVehicle.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' }
    });

    return vehicles;
  }

  async createVehicleForCustomer(customerId: string, data: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    color: string;
    mileage?: number;
    chassisNumber?: string;
  }) {
    // Verificar se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se já existe veículo com a mesma placa
    const existingVehicle = await prisma.customerVehicle.findFirst({
      where: { plate: data.plate }
    });

    if (existingVehicle) {
      throw new Error('Já existe um veículo cadastrado com esta placa');
    }

    // Criar veículo
    const vehicle = await prisma.customerVehicle.create({
      data: {
        customerId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate,
        color: data.color,
        mileage: data.mileage || null,
        chassisNumber: data.chassisNumber || null,
      }
    });

    return vehicle;
  }

  // ==================== QUOTES (ORÇAMENTOS) ====================

  async getQuotes(params: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page, limit, status, search } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      hasServices: true, // Filtro principal: apenas pedidos com serviços
    };

    if (status) {
      where.quoteStatus = status as any;
    }

    if (search) {
      where.OR = [
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, phone: true, email: true } },
          items: {
            where: { type: 'SERVICE' }, // Apenas itens de serviço
          },
        },
      }) as unknown as Promise<OrderWithRelations[]>,
      prisma.order.count({ where })
    ]);

    return {
      quotes: orders.map((order: OrderWithRelations) => this.mapOrderToQuote(order)),
      totalCount
    };
  }

  async getQuoteById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { name: true, phone: true, email: true } },
        items: {
          where: { type: 'SERVICE' },
        },
      },
    }) as unknown as OrderWithRelations | null;

    if (!order) {
      throw new Error('Orçamento não encontrado');
    }

    if (!order.hasServices) {
      throw new Error('Este pedido não contém serviços');
    }

    return this.mapOrderToQuote(order);
  }

  async updateQuotePrices(id: string, items: Array<{ id: string; quotedPrice: number }>) {
    // Atualizar preços dos itens
    await Promise.all(
      items.map(item =>
        prisma.orderItem.update({
          where: { id: item.id },
          data: {
            quotedPrice: item.quotedPrice,
            price: item.quotedPrice,
            subtotal: item.quotedPrice, // Será multiplicado pela quantidade via raw query
            priceQuoted: true,
            quotedAt: new Date(),
          },
        })
      )
    );

    // Buscar pedido com itens atualizados
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    // Recalcular total do pedido
    const newTotal = order.items.reduce((sum, item) => {
      return sum + (Number(item.price) * item.quantity);
    }, 0);

    // Atualizar pedido
    return prisma.order.update({
      where: { id },
      data: {
        total: newTotal,
        quoteStatus: 'QUOTED',
        quotedAt: new Date(),
      },
      include: { items: true, customer: true },
    });
  }

  async approveQuote(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new Error('Orçamento não encontrado');
    }

    if (order.quoteStatus !== 'QUOTED') {
      throw new Error('Orçamento precisa estar no status QUOTED para ser aprovado');
    }

    return prisma.order.update({
      where: { id },
      data: {
        quoteStatus: 'APPROVED',
        quoteApprovedAt: new Date(),
      },
    });
  }

  async rejectQuote(id: string) {
    return prisma.order.update({
      where: { id },
      data: {
        quoteStatus: 'REJECTED',
      },
    });
  }

  async updateQuoteStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: {
        quoteStatus: status as any,
      },
    });
  }

  // ==================== HELPER METHODS ====================

  private mapOrderItemToResponse(item: OrderItemWithRelations) {
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      type: (item.productId ? 'product' : 'service') as 'product' | 'service'
    };
  }

  private mapOrderToResponse(order: OrderWithRelations) {
    return {
      id: order.id,
      userId: order.customerId,
      customerName: order.customer.name,
      customerWhatsApp: order.customer.phone,
      items: order.items.map((item: OrderItemWithRelations) => this.mapOrderItemToResponse(item)),
      total: Number(order.total),
      hasProducts: order.items.some((item: OrderItemWithRelations) => item.productId !== null),
      hasServices: order.items.some((item: OrderItemWithRelations) => item.serviceId !== null),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      source: 'website' as const
    };
  }

  private mapOrderToQuote(order: OrderWithRelations) {
    return {
      id: order.id,
      userId: order.customerId,
      customerName: order.customer.name,
      customerWhatsApp: order.customer.phone,
      items: order.items.map((item: OrderItemWithRelations) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        quotedPrice: item.quotedPrice ? Number(item.quotedPrice) : null,
        priceQuoted: item.priceQuoted,
        type: 'service' as const,
      })),
      total: Number(order.total),
      hasProducts: order.hasProducts,
      hasServices: order.hasServices,
      status: order.quoteStatus || 'PENDING',
      createdAt: order.createdAt.toISOString(),
      quotedAt: order.quotedAt?.toISOString() || null,
      quoteApprovedAt: order.quoteApprovedAt?.toISOString() || null,
      quoteNotes: order.quoteNotes || null,
      source: 'website' as const,
    };
  }

  private mapCustomerToResponse(customer: Customer) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      whatsapp: customer.phone,
      cpf: customer.cpf,
      level: customer.level,
      status: customer.status,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString()
    };
  }
}
