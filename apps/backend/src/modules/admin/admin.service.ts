import { prisma } from '../../config/database.js';
import { CustomerLevel, CustomerStatus, OrderStatus, Prisma, Customer } from '@prisma/client';
import { HashUtil } from '@shared/utils/hash.util.js';

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
  createdAt: Date;
}

interface OrderWithRelations {
  id: string;
  customerId: string;
  addressId: string;
  subtotal: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  total: Prisma.Decimal;
  status: string;
  paymentMethod: string;
  couponId: string | null;
  discountAmount: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    name: string;
    phone: string;
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

  async updateCustomer(id: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    cpf?: string;
  }) {
    // Verificar se o cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    });

    if (!existingCustomer) {
      const error = new Error('Cliente não encontrado');
      (error as any).statusCode = 404;
      throw error;
    }

    // Se o email está sendo alterado, verificar se já existe outro cliente com esse email
    if (data.email && data.email !== existingCustomer.email) {
      const emailInUse = await prisma.customer.findUnique({
        where: { email: data.email }
      });

      if (emailInUse) {
        const error = new Error('Já existe um cliente cadastrado com este e-mail');
        (error as any).statusCode = 409;
        throw error;
      }
    }

    // Se o CPF está sendo alterado, verificar se já existe outro cliente com esse CPF
    if (data.cpf && data.cpf !== existingCustomer.cpf) {
      const cpfInUse = await prisma.customer.findUnique({
        where: { cpf: data.cpf }
      });

      if (cpfInUse) {
        const error = new Error('Já existe um cliente cadastrado com este CPF');
        (error as any).statusCode = 409;
        throw error;
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.cpf !== undefined && { cpf: data.cpf })
      }
    });

    return this.mapCustomerToResponse(customer);
  }

  async createCustomer(data: {
    name: string;
    email: string;
    phone: string;
    cpf?: string;
    birthDate?: string;
  }) {
    // Verificar se já existe um cliente com o mesmo email
    const existingEmail = await prisma.customer.findUnique({
      where: { email: data.email }
    });

    if (existingEmail) {
      const error = new Error('Já existe um cliente cadastrado com este e-mail');
      (error as any).statusCode = 409;
      throw error;
    }

    // Verificar se já existe um cliente com o mesmo CPF (se fornecido)
    if (data.cpf) {
      const existingCpf = await prisma.customer.findUnique({
        where: { cpf: data.cpf }
      });

      if (existingCpf) {
        const error = new Error('Já existe um cliente cadastrado com este CPF');
        (error as any).statusCode = 409;
        throw error;
      }
    }

    // Gerar senha provisória (primeiros 4 dígitos do telefone + últimos 4)
    const phoneDigits = data.phone ? data.phone.replace(/\D/g, '') : '';
    const provisionalPassword = phoneDigits.slice(0, 4) + phoneDigits.slice(-4);

    // Hash da senha provisória
    const hashedPassword = await HashUtil.hashPassword(provisionalPassword);

    // Criar o cliente com senha provisória
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
        password: hashedPassword,
        hasProvisionalPassword: true,
        status: CustomerStatus.ACTIVE,
        level: CustomerLevel.BRONZE
      }
    });

    return {
      customer: this.mapCustomerToResponse(customer),
      provisionalPassword // Retornar a senha para o admin informar o cliente
    };
  }

  async getCustomerVehicles(customerId: string, search?: string) {
    const where: Prisma.CustomerVehicleWhereInput = {
      customerId
    };

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { plate: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } }
      ];
    }

    const vehicles = await prisma.customerVehicle.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return vehicles;
  }

  async createCustomerVehicle(customerId: string, data: {
    brand: string;
    model: string;
    year: number;
    plate: string;
    chassisNumber?: string;
    color?: string;
    mileage?: number;
  }) {
    // Verificar se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar se já existe um veículo com essa placa
    const plateUpperCase = data.plate.toUpperCase();
    const existingVehicle = await prisma.customerVehicle.findUnique({
      where: { plate: plateUpperCase }
    });

    if (existingVehicle) {
      const error = new Error(`Já existe um veículo cadastrado com a placa ${plateUpperCase}`);
      (error as any).statusCode = 409;
      throw error;
    }

    // Criar o veículo
    const vehicle = await prisma.customerVehicle.create({
      data: {
        customerId,
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: plateUpperCase,
        chassisNumber: data.chassisNumber,
        color: data.color,
        mileage: data.mileage
      }
    });

    return vehicle;
  }

  async updateCustomerVehicle(customerId: string, vehicleId: string, data: {
    brand?: string;
    model?: string;
    year?: number;
    plate?: string;
    chassisNumber?: string;
    color?: string;
    mileage?: number;
  }) {
    // Verificar se o veículo existe e pertence ao cliente
    const vehicle = await prisma.customerVehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      const error = new Error('Veículo não encontrado');
      (error as any).statusCode = 404;
      throw error;
    }

    if (vehicle.customerId !== customerId) {
      const error = new Error('Este veículo não pertence ao cliente especificado');
      (error as any).statusCode = 403;
      throw error;
    }

    // Se estiver atualizando a placa, verificar se já existe outra com essa placa
    if (data.plate) {
      const plateUpperCase = data.plate.toUpperCase();
      if (plateUpperCase !== vehicle.plate) {
        const existingVehicle = await prisma.customerVehicle.findUnique({
          where: { plate: plateUpperCase }
        });

        if (existingVehicle) {
          const error = new Error(`Já existe um veículo cadastrado com a placa ${plateUpperCase}`);
          (error as any).statusCode = 409;
          throw error;
        }
      }
    }

    // Atualizar o veículo
    const updatedVehicle = await prisma.customerVehicle.update({
      where: { id: vehicleId },
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        plate: data.plate?.toUpperCase(),
        chassisNumber: data.chassisNumber,
        color: data.color,
        mileage: data.mileage
      }
    });

    return updatedVehicle;
  }

  async deleteCustomerVehicle(customerId: string, vehicleId: string) {
    // Verificar se o veículo existe e pertence ao cliente
    const vehicle = await prisma.customerVehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      const error = new Error('Veículo não encontrado');
      (error as any).statusCode = 404;
      throw error;
    }

    if (vehicle.customerId !== customerId) {
      const error = new Error('Este veículo não pertence ao cliente especificado');
      (error as any).statusCode = 403;
      throw error;
    }

    // Excluir o veículo
    await prisma.customerVehicle.delete({
      where: { id: vehicleId }
    });
  }

  // ==================== HELPER METHODS ====================

  private mapOrderItemToResponse(item: OrderItemWithRelations) {
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      type: (item.productId ? 'product' : 'service') as 'product' | 'service',
      linkedId: item.productId || item.serviceId || undefined
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
