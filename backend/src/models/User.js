// ========================================
// USER MODEL - MORIA BACKEND
// Model para usuários com métodos específicos
// ========================================

const BaseModel = require('./BaseModel.js');
const bcrypt = require('bcrypt');

class User extends BaseModel {
  constructor() {
    super('users');
  }

  // Buscar usuário por email (incluindo password_hash para autenticação)
  async findByEmail(email) {
    try {
      return await this.db(this.tableName)
        .where('email', email)
        .first();
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  // Verificar senha
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Criar usuário com hash da senha
  async create(userData) {
    try {
      if (userData.password) {
        userData.password_hash = await bcrypt.hash(userData.password, 12);
        delete userData.password; // Remove a senha em texto claro
      }

      return await super.create(userData);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário (com possível mudança de senha)
  async update(id, userData) {
    try {
      if (userData.password) {
        userData.password_hash = await bcrypt.hash(userData.password, 12);
        delete userData.password;
      }

      return await super.update(id, userData);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Buscar usuários ativos
  async findActiveUsers() {
    return await this.findAll({ is_active: true });
  }

  // Buscar por role
  async findByRole(role) {
    return await this.findAll({ role });
  }

  // Atualizar último login
  async updateLastLogin(id) {
    return await super.update(id, { last_login_at: new Date() });
  }

  // Incrementar total de pedidos e gastos
  async incrementOrderStats(id, orderValue) {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      return await super.update(id, {
        total_orders: user.total_orders + 1,
        total_spent: parseFloat(user.total_spent) + parseFloat(orderValue)
      });
    } catch (error) {
      console.error('Erro ao incrementar stats do usuário:', error);
      throw error;
    }
  }

  // Override findById para não retornar senha (por padrão)
  async findById(id, includePassword = false) {
    try {
      const user = await super.findById(id);
      if (user && !includePassword) {
        delete user.password_hash;
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Override findAll para não retornar senhas
  async findAll(filters = {}, options = {}) {
    try {
      const users = await super.findAll(filters, options);
      return users.map(user => {
        delete user.password_hash;
        return user;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new User();