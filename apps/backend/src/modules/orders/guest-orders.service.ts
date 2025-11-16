import { Order, OrderItem, CustomerStatus, CustomerLevel } from '@prisma/client';
import { prisma } from '@config/database.js';
import { ApiError } from '@shared/utils/error.util.js';
import { HashUtil } from '@shared/utils/hash.util.js';
import { logger } from '@shared/utils/logger.util.js';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto.js';

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export interface GuestOrderResponse {
  order: OrderWithItems | null;
  quote: OrderWithItems | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    isProvisional: boolean;
  };
  whatsappMessage: string;
}

export class GuestOrdersService {
  /**
   * Create order for guest user (without authentication)
   * Creates provisional customer and processes order
   */
  async createGuestOrder(dto: CreateGuestOrderDto): Promise<GuestOrderResponse> {
    // 1. Create or get provisional customer
    const customer = await this.getOrCreateProvisionalCustomer(
      dto.customerName,
      dto.customerWhatsApp
    );

    // 2. Separate products and services
    const productItems = dto.items.filter(item => item.type === 'PRODUCT');
    const serviceItems = dto.items.filter(item => item.type === 'SERVICE');

    // 3. Fetch products and services from database
    const productIds = productItems
      .filter(item => item.productId)
      .map(item => item.productId!);

    const serviceIds = serviceItems
      .filter(item => item.serviceId)
      .map(item => item.serviceId!);

    const [products, services] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds } },
      }),
      prisma.service.findMany({
        where: { id: { in: serviceIds } },
      }),
    ]);

    // 4. Validate all items exist and are available
    for (const item of productItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw ApiError.notFound(`Product ${item.productId} not found`);
      }
      if (product.status !== 'ACTIVE') {
        throw ApiError.badRequest(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(`Insufficient stock for product ${product.name}`);
      }
    }

    for (const item of serviceItems) {
      const service = services.find(s => s.id === item.serviceId);
      if (!service) {
        throw ApiError.notFound(`Service ${item.serviceId} not found`);
      }
      if (service.status !== 'ACTIVE') {
        throw ApiError.badRequest(`Service ${service.name} is not available`);
      }
    }

    // 5. Apply coupon discount if provided
    let discountAmount = 0;
    if (dto.couponCode) {
      discountAmount = await this.calculateCouponDiscount(
        dto.couponCode,
        productItems,
        products
      );
    }

    // 6. Generate session ID to link order and quote
    const sessionId = Date.now().toString();

    // 7. Create order (for products) and quote (for services)
    let order: OrderWithItems | null = null;
    let quote: OrderWithItems | null = null;

    if (productItems.length > 0) {
      order = await this.createProductOrder(
        customer.id,
        productItems,
        products,
        sessionId,
        serviceItems.length > 0,
        dto.couponCode,
        discountAmount
      );
    }

    if (serviceItems.length > 0) {
      quote = await this.createServiceQuote(
        customer.id,
        serviceItems,
        services,
        sessionId,
        productItems.length > 0
      );
    }

    // 8. Generate WhatsApp message
    const whatsappMessage = this.generateWhatsAppMessage(
      customer,
      order,
      quote
    );

    logger.info(`Guest order created: Order=${order?.id}, Quote=${quote?.id}, Customer=${customer.id}`);

    return {
      order,
      quote,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        isProvisional: true,
      },
      whatsappMessage,
    };
  }

  /**
   * Get or create provisional customer
   */
  private async getOrCreateProvisionalCustomer(
    name: string,
    whatsapp: string
  ): Promise<{ id: string; name: string; phone: string; email: string }> {
    // Clean whatsapp number
    const cleanPhone = whatsapp.replace(/\D/g, '');

    // Check if provisional customer already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        phone: cleanPhone,
        email: { contains: '@provisional.moria.com' },
      },
    });

    if (existingCustomer) {
      return {
        id: existingCustomer.id,
        name: existingCustomer.name,
        phone: existingCustomer.phone,
        email: existingCustomer.email,
      };
    }

    // Create provisional customer
    const email = `${cleanPhone}@provisional.moria.com`;
    const password = await HashUtil.hashPassword(name.slice(0, 3).toLowerCase());

    const customer = await prisma.customer.create({
      data: {
        email,
        password,
        name,
        phone: cleanPhone,
        status: CustomerStatus.ACTIVE,
        level: CustomerLevel.BRONZE,
        hasProvisionalPassword: true, // Mark as having provisional password
      },
    });

    logger.info(`Provisional customer created: ${customer.id}`);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
    };
  }

  /**
   * Calculate coupon discount
   */
  private async calculateCouponDiscount(
    couponCode: string,
    productItems: any[],
    products: any[]
  ): Promise<number> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon) {
      throw ApiError.notFound('Coupon not found');
    }

    if (!coupon.isActive) {
      throw ApiError.badRequest('Coupon is not active');
    }

    if (new Date() > coupon.expiresAt) {
      throw ApiError.badRequest('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('Coupon usage limit reached');
    }

    // Calculate subtotal for products
    let subtotal = 0;
    for (const item of productItems) {
      const product = products.find(p => p.id === item.productId)!;
      const price = Number(product.promoPrice || product.salePrice);
      subtotal += price * item.quantity;
    }

    if (coupon.minValue && subtotal < Number(coupon.minValue)) {
      throw ApiError.badRequest(`Minimum order value is ${coupon.minValue}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = subtotal * (Number(coupon.discountValue) / 100);
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
      discountAmount = Number(coupon.maxDiscount);
    }

    return discountAmount;
  }

  /**
   * Create product order
   */
  private async createProductOrder(
    customerId: string,
    productItems: any[],
    products: any[],
    _sessionId: string,
    hasLinkedQuote: boolean,
    couponCode?: string,
    discountAmount: number = 0
  ): Promise<OrderWithItems> {
    // Calculate order items and totals
    let subtotal = 0;
    const orderItems: Array<{
      productId: string;
      type: 'PRODUCT';
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of productItems) {
      const product = products.find(p => p.id === item.productId)!;
      const price = Number(product.promoPrice || product.salePrice);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: item.productId!,
        type: 'PRODUCT',
        name: product.name,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    const total = subtotal - discountAmount;

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const createdOrder = await tx.order.create({
        data: {
          customerId,
          addressId: '00000000-0000-0000-0000-000000000000', // Placeholder for guest orders
          source: 'WEB',
          hasProducts: true,
          hasServices: hasLinkedQuote,
          subtotal,
          discountAmount,
          total,
          paymentMethod: 'PENDING', // Will be defined via WhatsApp
          couponCode,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Update product stock
      for (const item of productItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Update coupon usage
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Update customer stats
      await tx.customer.update({
        where: { id: customerId },
        data: {
          totalOrders: {
            increment: 1,
          },
          totalSpent: {
            increment: total,
          },
        },
      });

      return createdOrder;
    });

    return order;
  }

  /**
   * Create service quote
   */
  private async createServiceQuote(
    customerId: string,
    serviceItems: any[],
    services: any[],
    _sessionId: string,
    hasLinkedOrder: boolean
  ): Promise<OrderWithItems> {
    // Prepare service items (no pricing yet)
    const quoteItems: Array<{
      serviceId: string;
      type: 'SERVICE';
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }> = [];

    for (const item of serviceItems) {
      const service = services.find(s => s.id === item.serviceId)!;
      // Services will be priced by admin later
      quoteItems.push({
        serviceId: item.serviceId!,
        type: 'SERVICE',
        name: service.name,
        price: 0, // Quote pending
        quantity: item.quantity,
        subtotal: 0,
      });
    }

    // Create quote (order with services)
    const quote = await prisma.order.create({
      data: {
        customerId,
        addressId: '00000000-0000-0000-0000-000000000000', // Placeholder
        source: 'WEB',
        hasProducts: hasLinkedOrder,
        hasServices: true,
        subtotal: 0,
        discountAmount: 0,
        total: 0, // Will be calculated by admin
        paymentMethod: 'PENDING',
        status: 'PENDING',
        items: {
          create: quoteItems,
        },
      },
      include: {
        items: true,
      },
    });

    return quote;
  }

  /**
   * Generate WhatsApp message
   */
  private generateWhatsAppMessage(
    customer: { name: string; phone: string },
    order: OrderWithItems | null,
    quote: OrderWithItems | null
  ): string {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(price);
    };

    let message = `🔧 *Moria Peças e Serviços*\n`;
    message += `👤 *Cliente:* ${customer.name}\n`;
    message += `📞 *WhatsApp:* ${customer.phone}\n`;

    if (order && quote) {
      message += `📋 *Pedido:* #${order.id} | *Orçamento:* #${quote.id}\n\n`;
    } else if (order) {
      message += `📋 *Pedido:* #${order.id}\n\n`;
    } else if (quote) {
      message += `📋 *Orçamento:* #${quote.id}\n\n`;
    }

    if (order) {
      message += `🛒 *PRODUTOS:*\n`;
      order.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Quantidade: ${item.quantity}x\n`;
        message += `   • Valor: ${formatPrice(Number(item.price))}\n`;
        message += `   • Subtotal: ${formatPrice(Number(item.subtotal))}\n\n`;
      });
      message += `💰 *Total dos Produtos: ${formatPrice(Number(order.total))}*\n\n`;
    }

    if (quote) {
      message += `🔧 *SERVIÇOS (Orçamento):*\n`;
      quote.items.forEach((item, index) => {
        message += `${index + 1}. ${item.name}\n`;
        message += `   • Quantidade: ${item.quantity}x\n\n`;
      });
    }

    if (order && quote) {
      message += `📋 Este cliente possui produtos para compra e serviços que precisam de orçamento.\n\n`;
    } else if (quote) {
      message += `📋 Solicitação de orçamento para os serviços listados acima.\n\n`;
    }

    message += `🕒 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}\n\n`;
    message += `Gostaria de confirmar${order ? ' este pedido' : ''}${order && quote ? ' e receber o orçamento' : quote ? ' o orçamento' : ''}. Aguardo retorno!`;

    return message;
  }
}
