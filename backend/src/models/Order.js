// ========================================
// ORDER MODEL - MORIA BACKEND
// Model para pedidos com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');
const { db } = require('../database.js');

class Order extends BaseModel {
  constructor() {
    super('orders');
  }

  // Gerar número de pedido único
  generateOrderNumber() {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MOR${timestamp}${random}`;
  }

  // Criar pedido com itens
  async createWithItems(orderData, items) {
    const trx = await db.transaction();

    try {
      // Gerar número do pedido
      orderData.order_number = this.generateOrderNumber();

      // Garantir que customer_address seja JSON
      if (typeof orderData.customer_address === 'object') {
        orderData.customer_address = JSON.stringify(orderData.customer_address);
      }

      if (typeof orderData.applied_promotions === 'object') {
        orderData.applied_promotions = JSON.stringify(orderData.applied_promotions);
      }

      // Criar o pedido
      const now = new Date();
      const orderWithTimestamps = {
        ...orderData,
        created_at: now,
        updated_at: now
      };

      const [orderId] = await trx('orders').insert(orderWithTimestamps);

      // Criar os itens do pedido
      const orderItems = items.map(item => ({
        order_id: orderId,
        type: item.type,
        item_id: item.item_id,
        item_name: item.item_name,
        item_description: item.item_description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        original_unit_price: item.original_unit_price || item.unit_price,
        applied_promotions: JSON.stringify(item.applied_promotions || []),
        item_specifications: JSON.stringify(item.item_specifications || {}),
        created_at: now,
        updated_at: now
      }));

      await trx('order_items').insert(orderItems);

      await trx.commit();

      // Retornar pedido completo com itens
      return await this.findByIdWithItems(orderId);
    } catch (error) {
      await trx.rollback();
      console.error('Erro ao criar pedido com itens:', error);
      throw error;
    }
  }

  // Buscar pedido com itens
  async findByIdWithItems(id) {
    try {
      const order = await this.findById(id);
      if (!order) return null;

      const items = await db('order_items').where('order_id', id);

      return {
        ...order,
        items: items.map(item => ({
          ...item,
          applied_promotions: this.parseJSON(item.applied_promotions),
          item_specifications: this.parseJSON(item.item_specifications)
        })),
        customer_address: this.parseJSON(order.customer_address),
        applied_promotions: this.parseJSON(order.applied_promotions)
      };
    } catch (error) {
      console.error('Erro ao buscar pedido com itens:', error);
      throw error;
    }
  }

  // Buscar pedidos de um usuário
  async findByUserId(userId, options = {}) {
    try {
      return await this.findAll({ user_id: userId }, options);
    } catch (error) {
      console.error('Erro ao buscar pedidos do usuário:', error);
      throw error;
    }
  }

  // Buscar por status
  async findByStatus(status) {
    return await this.findAll({ status });
  }

  // Atualizar status do pedido
  async updateStatus(id, status, adminNotes = null) {
    try {
      const updateData = { status };

      // Adicionar timestamps específicos baseado no status
      const now = new Date();
      switch (status) {
        case 'confirmed':
          updateData.confirmed_at = now;
          break;
        case 'shipped':
          updateData.shipped_at = now;
          break;
        case 'delivered':
          updateData.delivered_at = now;
          break;
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      return await super.update(id, updateData);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  // Estatísticas de pedidos
  async getStats(startDate = null, endDate = null) {
    try {
      let query = db('orders');

      if (startDate && endDate) {
        query = query.whereBetween('created_at', [startDate, endDate]);
      }

      const result = await query
        .select([
          db.raw('COUNT(*) as total_orders'),
          db.raw('SUM(total_amount) as total_revenue'),
          db.raw('AVG(total_amount) as average_order_value'),
          db.raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_orders'),
          db.raw('COUNT(CASE WHEN status = "delivered" THEN 1 END) as delivered_orders'),
          db.raw('COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_orders')
        ]);

      return result[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pedidos:', error);
      throw error;
    }
  }

  // Utilitário para fazer parse de JSON com fallback
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return jsonString; // Retorna o valor original se não for JSON válido
    }
  }
}

module.exports = new Order();