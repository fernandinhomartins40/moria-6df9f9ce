// ========================================
// COUPON MODEL - MORIA BACKEND
// Model para cupons com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');

class Coupon extends BaseModel {
  constructor() {
    super('coupons');
  }

  // Buscar cupom por código
  async findByCode(code) {
    try {
      const result = await this.db(this.tableName)
        .where('code', code.toUpperCase())
        .first();

      return result || null;
    } catch (error) {
      console.error('Erro ao buscar cupom por código:', error);
      throw error;
    }
  }

  // Validar cupom
  async validateCoupon(code, orderAmount = 0, userId = null) {
    try {
      const coupon = await this.findByCode(code);

      if (!coupon) {
        return {
          valid: false,
          reason: 'Cupom não encontrado',
          coupon: null,
          discount: 0
        };
      }

      if (!coupon.is_active) {
        return {
          valid: false,
          reason: 'Cupom inativo',
          coupon,
          discount: 0
        };
      }

      // Verificar datas
      const now = new Date();
      if (coupon.starts_at > now) {
        return {
          valid: false,
          reason: 'Cupom ainda não válido',
          coupon,
          discount: 0
        };
      }

      if (coupon.expires_at && coupon.expires_at < now) {
        return {
          valid: false,
          reason: 'Cupom expirado',
          coupon,
          discount: 0
        };
      }

      // Verificar valor mínimo do pedido
      if (orderAmount < coupon.min_order_amount) {
        return {
          valid: false,
          reason: `Valor mínimo do pedido: R$ ${coupon.min_order_amount.toFixed(2)}`,
          coupon,
          discount: 0
        };
      }

      // Verificar limite de uso total
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        return {
          valid: false,
          reason: 'Limite de uso do cupom atingido',
          coupon,
          discount: 0
        };
      }

      // Verificar usuários permitidos
      const allowedUsers = this.parseJSON(coupon.allowed_users);
      if (allowedUsers.length > 0 && userId && !allowedUsers.includes(userId)) {
        return {
          valid: false,
          reason: 'Cupom não disponível para este usuário',
          coupon,
          discount: 0
        };
      }

      // TODO: Verificar primeira compra se necessário
      // TODO: Verificar limite por usuário

      // Calcular desconto
      const discount = this.calculateDiscount(coupon, orderAmount);

      return {
        valid: true,
        reason: 'Cupom válido',
        coupon,
        discount
      };
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      return {
        valid: false,
        reason: 'Erro interno',
        coupon: null,
        discount: 0
      };
    }
  }

  // Calcular desconto do cupom
  calculateDiscount(coupon, orderAmount) {
    try {
      let discount = 0;

      if (coupon.discount_type === 'percentage') {
        discount = orderAmount * (coupon.discount_value / 100);

        // Aplicar desconto máximo se configurado
        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
          discount = coupon.max_discount_amount;
        }
      } else if (coupon.discount_type === 'fixed_amount') {
        discount = coupon.discount_value;
      }

      // Não pode ser maior que o valor do pedido
      return Math.min(discount, orderAmount);
    } catch (error) {
      console.error('Erro ao calcular desconto do cupom:', error);
      return 0;
    }
  }

  // Incrementar uso do cupom
  async incrementUsage(id) {
    try {
      const coupon = await this.findById(id);
      if (!coupon) return null;

      return await super.update(id, {
        used_count: coupon.used_count + 1
      });
    } catch (error) {
      console.error('Erro ao incrementar uso do cupom:', error);
      throw error;
    }
  }

  // Buscar cupons ativos
  async findActive() {
    try {
      const now = new Date();

      return await this.db(this.tableName)
        .where('is_active', true)
        .where(function() {
          this.whereNull('starts_at').orWhere('starts_at', '<=', now);
        })
        .where(function() {
          this.whereNull('expires_at').orWhere('expires_at', '>=', now);
        })
        .where(function() {
          this.whereNull('max_uses').orWhereRaw('used_count < max_uses');
        });
    } catch (error) {
      console.error('Erro ao buscar cupons ativos:', error);
      throw error;
    }
  }

  // Gerar código único para cupom
  generateUniqueCode(prefix = 'CUP', length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;

    for (let i = prefix.length; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  // Override do método create para processar dados
  async create(couponData) {
    try {
      // Converter código para maiúsculo
      if (couponData.code) {
        couponData.code = couponData.code.toUpperCase();
      }

      // Garantir que arrays sejam JSON válidos
      const arrayFields = ['applicable_products', 'applicable_categories', 'excluded_products', 'allowed_users'];
      for (const field of arrayFields) {
        if (Array.isArray(couponData[field]) || typeof couponData[field] === 'object') {
          couponData[field] = JSON.stringify(couponData[field] || []);
        }
      }

      return await super.create(couponData);
    } catch (error) {
      console.error('Erro ao criar cupom:', error);
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

module.exports = new Coupon();