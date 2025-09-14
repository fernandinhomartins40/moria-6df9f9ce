// ========================================
// PRODUCT MODEL - MORIA BACKEND
// Model para produtos com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');

class Product extends BaseModel {
  constructor() {
    super('products');
  }

  // Buscar produtos ativos
  async findActive() {
    return await this.findAll({ is_active: true });
  }

  // Buscar por categoria
  async findByCategory(category) {
    return await this.findAll({ category, is_active: true });
  }

  // Buscar por subcategoria
  async findBySubcategory(subcategory) {
    return await this.findAll({ subcategory, is_active: true });
  }

  // Buscar por fornecedor
  async findBySupplier(supplier) {
    return await this.findAll({ supplier, is_active: true });
  }

  // Buscar produtos em promoção
  async findOnSale() {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .where(function() {
          this.whereNotNull('sale_price')
            .orWhereNotNull('promo_price');
        })
        .orderBy('created_at', 'desc');
    } catch (error) {
      console.error('Erro ao buscar produtos em promoção:', error);
      throw error;
    }
  }

  // Buscar produtos com estoque baixo
  async findLowStock() {
    try {
      return await this.db(this.tableName)
        .whereRaw('stock <= min_stock')
        .where('is_active', true)
        .orderBy('stock', 'asc');
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      throw error;
    }
  }

  // Atualizar estoque
  async updateStock(id, quantity, operation = 'decrease') {
    try {
      const product = await this.findById(id);
      if (!product) return null;

      const newStock = operation === 'increase'
        ? product.stock + quantity
        : product.stock - quantity;

      if (newStock < 0) {
        throw new Error('Estoque insuficiente');
      }

      return await super.update(id, { stock: newStock });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }

  // Incrementar contador de visualizações
  async incrementViews(id) {
    try {
      const product = await this.findById(id);
      if (!product) return null;

      return await super.update(id, {
        views_count: product.views_count + 1
      });
    } catch (error) {
      console.error('Erro ao incrementar visualizações:', error);
      throw error;
    }
  }

  // Incrementar contador de vendas
  async incrementSales(id, quantity = 1) {
    try {
      const product = await this.findById(id);
      if (!product) return null;

      return await super.update(id, {
        sales_count: product.sales_count + quantity
      });
    } catch (error) {
      console.error('Erro ao incrementar vendas:', error);
      throw error;
    }
  }

  // Buscar produtos mais vendidos
  async findBestSellers(limit = 10) {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .orderBy('sales_count', 'desc')
        .limit(limit);
    } catch (error) {
      console.error('Erro ao buscar mais vendidos:', error);
      throw error;
    }
  }

  // Buscar produtos com melhor avaliação
  async findTopRated(limit = 10) {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .where('rating_count', '>', 0)
        .orderBy('rating', 'desc')
        .limit(limit);
    } catch (error) {
      console.error('Erro ao buscar top avaliados:', error);
      throw error;
    }
  }

  // Buscar por faixa de preço
  async findByPriceRange(minPrice, maxPrice) {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .whereBetween('price', [minPrice, maxPrice])
        .orderBy('price', 'asc');
    } catch (error) {
      console.error('Erro ao buscar por faixa de preço:', error);
      throw error;
    }
  }

  // Override do método create para processar imagens
  async create(productData) {
    try {
      // Garantir que images seja um JSON válido
      if (Array.isArray(productData.images)) {
        productData.images = JSON.stringify(productData.images);
      }

      // Garantir que specifications seja um JSON válido
      if (typeof productData.specifications === 'object') {
        productData.specifications = JSON.stringify(productData.specifications);
      }

      // Garantir que vehicle_compatibility seja um JSON válido
      if (Array.isArray(productData.vehicle_compatibility)) {
        productData.vehicle_compatibility = JSON.stringify(productData.vehicle_compatibility);
      }

      return await super.create(productData);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  }
}

module.exports = new Product();