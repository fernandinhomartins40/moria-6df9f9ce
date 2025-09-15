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

  // Buscar por SKU
  async findBySku(sku) {
    if (!sku) return null;
    try {
      return await this.db(this.tableName)
        .where('sku', sku)
        .first();
    } catch (error) {
      console.error('Erro ao buscar produto por SKU:', error);
      throw error;
    }
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

  // Buscar com paginação e filtros avançados
  async findWithPagination(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = this.db(this.tableName);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'search') {
            // Busca textual em nome e descrição
            query = query.where(function() {
              this.where('name', 'like', `%${value}%`)
                  .orWhere('description', 'like', `%${value}%`)
                  .orWhere('sku', 'like', `%${value}%`);
            });
          } else if (key === 'min_price') {
            query = query.where('price', '>=', value);
          } else if (key === 'max_price') {
            query = query.where('price', '<=', value);
          } else if (key === 'on_sale') {
            query = query.where(function() {
              this.whereNotNull('sale_price')
                  .orWhereNotNull('promo_price');
            });
          } else {
            query = query.where(key, value);
          }
        }
      });

      // Contar total
      const totalQuery = query.clone();
      const [{ count }] = await totalQuery.count('* as count');

      // Buscar dados com paginação
      const data = await query.orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      return {
        data,
        pagination: {
          current_page: page,
          per_page: limit,
          total: parseInt(count),
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar produtos com paginação:', error);
      throw error;
    }
  }

  // Buscar produtos populares
  async findPopular(limit = 10) {
    try {
      return await this.db(this.tableName)
        .where('is_active', true)
        .orderBy('sales_count', 'desc')
        .orderBy('views_count', 'desc')
        .limit(limit);
    } catch (error) {
      console.error('Erro ao buscar produtos populares:', error);
      throw error;
    }
  }

  // Buscar por categoria com paginação
  async findByCategory(category, options = {}) {
    const { page = 1, limit = 10 } = options;
    return await this.findWithPagination({ category, is_active: true }, page, limit);
  }

  // Obter categorias únicas
  async getCategories() {
    try {
      const result = await this.db(this.tableName)
        .where('is_active', true)
        .distinct('category')
        .orderBy('category');

      return result.map(row => row.category);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  // Obter estatísticas
  async getStats() {
    try {
      const [stats] = await this.db(this.tableName).count('* as total')
        .count(this.db.raw('CASE WHEN is_active = true THEN 1 END as active'))
        .count(this.db.raw('CASE WHEN stock <= min_stock THEN 1 END as low_stock'))
        .sum('stock as total_stock')
        .avg('price as avg_price');

      return {
        total: parseInt(stats.total) || 0,
        active: parseInt(stats.active) || 0,
        low_stock: parseInt(stats.low_stock) || 0,
        total_stock: parseInt(stats.total_stock) || 0,
        avg_price: parseFloat(stats.avg_price) || 0
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
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

  // Métodos de favoritos
  async getFavoritesByUser(userId) {
    try {
      return await this.db(this.tableName)
        .join('favorites', 'products.id', 'favorites.product_id')
        .where('favorites.user_id', userId)
        .select('products.*')
        .orderBy('favorites.created_at', 'desc');
    } catch (error) {
      console.error('Erro ao buscar favoritos do usuário:', error);
      throw error;
    }
  }

  async isFavorite(userId, productId) {
    try {
      const result = await this.db('favorites')
        .where('user_id', userId)
        .where('product_id', productId)
        .first();
      return !!result;
    } catch (error) {
      console.error('Erro ao verificar se produto é favorito:', error);
      throw error;
    }
  }

  async addToFavorites(userId, productId) {
    try {
      return await this.db('favorites').insert({
        user_id: userId,
        product_id: productId,
        created_at: new Date(),
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Erro ao adicionar aos favoritos:', error);
      throw error;
    }
  }

  async removeFromFavorites(userId, productId) {
    try {
      return await this.db('favorites')
        .where('user_id', userId)
        .where('product_id', productId)
        .del();
    } catch (error) {
      console.error('Erro ao remover dos favoritos:', error);
      throw error;
    }
  }
}

module.exports = new Product();