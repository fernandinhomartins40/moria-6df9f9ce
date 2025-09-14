// ========================================
// PROMOTION MODEL - MORIA BACKEND
// Model para promoções com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');

class Promotion extends BaseModel {
  constructor() {
    super('promotions');
  }

  // Buscar promoções ativas
  async findActive() {
    try {
      const now = new Date();

      return await this.db(this.tableName)
        .where('is_active', true)
        .where('start_date', '<=', now)
        .where(function() {
          this.whereNull('end_date').orWhere('end_date', '>=', now);
        })
        .orderBy('priority', 'desc');
    } catch (error) {
      console.error('Erro ao buscar promoções ativas:', error);
      throw error;
    }
  }

  // Buscar promoções aplicáveis a um produto
  async findByProduct(productId) {
    try {
      const activePromotions = await this.findActive();

      return activePromotions.filter(promotion => {
        const applicableProducts = this.parseJSON(promotion.applicable_products);
        const excludedProducts = this.parseJSON(promotion.excluded_products);

        // Se tem produtos específicos, verificar se está incluído
        if (applicableProducts.length > 0) {
          return applicableProducts.includes(productId);
        }

        // Se tem produtos excluídos, verificar se não está excluído
        if (excludedProducts.length > 0) {
          return !excludedProducts.includes(productId);
        }

        // Se não tem restrições específicas, aplica a todos
        return true;
      });
    } catch (error) {
      console.error('Erro ao buscar promoções por produto:', error);
      throw error;
    }
  }

  // Buscar promoções aplicáveis a uma categoria
  async findByCategory(category) {
    try {
      const activePromotions = await this.findActive();

      return activePromotions.filter(promotion => {
        const applicableCategories = this.parseJSON(promotion.applicable_categories);

        // Se tem categorias específicas, verificar se está incluída
        if (applicableCategories.length > 0) {
          return applicableCategories.includes(category);
        }

        // Se não tem restrições de categoria, pode aplicar
        return true;
      });
    } catch (error) {
      console.error('Erro ao buscar promoções por categoria:', error);
      throw error;
    }
  }

  // Calcular desconto de uma promoção
  calculateDiscount(promotion, quantity, unitPrice, totalAmount) {
    try {
      let discount = 0;

      switch (promotion.type) {
        case 'percentage':
          discount = totalAmount * (promotion.discount_value / 100);
          break;

        case 'fixed_amount':
          discount = promotion.discount_value;
          break;

        case 'buy_x_get_y':
          if (quantity >= promotion.buy_quantity) {
            const freeItems = Math.floor(quantity / promotion.buy_quantity) * promotion.get_quantity;
            discount = Math.min(freeItems, quantity) * unitPrice;
          }
          break;
      }

      // Não pode ser maior que o valor total
      return Math.min(discount, totalAmount);
    } catch (error) {
      console.error('Erro ao calcular desconto:', error);
      return 0;
    }
  }

  // Incrementar uso da promoção
  async incrementUsage(id) {
    try {
      const promotion = await this.findById(id);
      if (!promotion) return null;

      return await super.update(id, {
        current_usage: promotion.current_usage + 1
      });
    } catch (error) {
      console.error('Erro ao incrementar uso da promoção:', error);
      throw error;
    }
  }

  // Verificar se promoção pode ser usada
  async canUsePromotion(promotionId, userId = null) {
    try {
      const promotion = await this.findById(promotionId);
      if (!promotion || !promotion.is_active) {
        return { valid: false, reason: 'Promoção não encontrada ou inativa' };
      }

      // Verificar datas
      const now = new Date();
      if (promotion.start_date > now) {
        return { valid: false, reason: 'Promoção ainda não iniciou' };
      }
      if (promotion.end_date && promotion.end_date < now) {
        return { valid: false, reason: 'Promoção expirada' };
      }

      // Verificar limite de uso total
      if (promotion.usage_limit && promotion.current_usage >= promotion.usage_limit) {
        return { valid: false, reason: 'Limite de uso da promoção atingido' };
      }

      // TODO: Verificar limite por usuário quando implementarmos rastreamento

      return { valid: true };
    } catch (error) {
      console.error('Erro ao verificar promoção:', error);
      return { valid: false, reason: 'Erro interno' };
    }
  }

  // Override do método create para processar JSONs
  async create(promotionData) {
    try {
      // Garantir que arrays sejam JSON válidos
      const fields = ['applicable_products', 'applicable_categories', 'excluded_products', 'conditions'];

      for (const field of fields) {
        if (Array.isArray(promotionData[field]) || typeof promotionData[field] === 'object') {
          promotionData[field] = JSON.stringify(promotionData[field] || []);
        }
      }

      return await super.create(promotionData);
    } catch (error) {
      console.error('Erro ao criar promoção:', error);
      throw error;
    }
  }

  // Utilitário para fazer parse de JSON com fallback
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return [];
    }
  }
}

module.exports = new Promotion();