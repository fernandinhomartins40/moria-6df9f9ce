// ========================================
// SERVICE MODEL - MORIA BACKEND
// Model para serviços com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');

class Service extends BaseModel {
  constructor() {
    super('services');
  }

  // Buscar serviços ativos
  async findActive() {
    return await this.findAll({ is_active: true });
  }

  // Buscar por categoria
  async findByCategory(category) {
    return await this.findAll({ category, is_active: true });
  }

  // Buscar serviços mais populares
  async findPopular(limit = 10) {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .orderBy('bookings_count', 'desc')
        .limit(limit);
    } catch (error) {
      console.error('Erro ao buscar serviços populares:', error);
      throw error;
    }
  }

  // Incrementar contador de agendamentos
  async incrementBookings(id) {
    try {
      const service = await this.findById(id);
      if (!service) return null;

      return await super.update(id, {
        bookings_count: service.bookings_count + 1
      });
    } catch (error) {
      console.error('Erro ao incrementar agendamentos:', error);
      throw error;
    }
  }

  // Override do método create para processar JSONs
  async create(serviceData) {
    try {
      // Garantir que specifications seja um JSON válido
      if (typeof serviceData.specifications === 'object') {
        serviceData.specifications = JSON.stringify(serviceData.specifications);
      }

      // Garantir que required_items seja um JSON válido
      if (Array.isArray(serviceData.required_items)) {
        serviceData.required_items = JSON.stringify(serviceData.required_items);
      }

      return await super.create(serviceData);
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      throw error;
    }
  }
}

module.exports = new Service();