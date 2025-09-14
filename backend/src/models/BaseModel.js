// ========================================
// MODEL BASE - MORIA BACKEND
// Classe base para todos os models com métodos CRUD
// ========================================

const { db } = require('../database.js');

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  // Buscar todos os registros
  async findAll(filters = {}, options = {}) {
    try {
      let query = this.db(this.tableName);

      // Aplicar filtros
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key.includes('search')) {
            // Para campos de busca textual
            const column = key.replace('search_', '');
            query = query.where(column, 'like', `%${value}%`);
          } else if (Array.isArray(value)) {
            // Para arrays (whereIn)
            query = query.whereIn(key, value);
          } else {
            query = query.where(key, value);
          }
        }
      });

      // Ordenação
      if (options.orderBy) {
        query = query.orderBy(options.orderBy.column, options.orderBy.direction || 'asc');
      } else {
        query = query.orderBy('created_at', 'desc');
      }

      // Paginação
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.offset(options.offset);
      }

      return await query;
    } catch (error) {
      console.error(`Erro ao buscar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Buscar por ID
  async findById(id) {
    try {
      return await this.db(this.tableName).where('id', id).first();
    } catch (error) {
      console.error(`Erro ao buscar ${this.tableName} por ID:`, error);
      throw error;
    }
  }

  // Buscar um registro por filtro
  async findOne(filters) {
    try {
      let query = this.db(this.tableName);

      Object.keys(filters).forEach(key => {
        query = query.where(key, filters[key]);
      });

      return await query.first();
    } catch (error) {
      console.error(`Erro ao buscar um ${this.tableName}:`, error);
      throw error;
    }
  }

  // Criar novo registro
  async create(data) {
    try {
      const now = new Date();
      const dataWithTimestamps = {
        ...data,
        created_at: now,
        updated_at: now
      };

      const [id] = await this.db(this.tableName).insert(dataWithTimestamps);
      return await this.findById(id);
    } catch (error) {
      console.error(`Erro ao criar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Atualizar registro
  async update(id, data) {
    try {
      const dataWithTimestamp = {
        ...data,
        updated_at: new Date()
      };

      await this.db(this.tableName).where('id', id).update(dataWithTimestamp);
      return await this.findById(id);
    } catch (error) {
      console.error(`Erro ao atualizar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Deletar registro
  async delete(id) {
    try {
      const deleted = await this.db(this.tableName).where('id', id).del();
      return deleted > 0;
    } catch (error) {
      console.error(`Erro ao deletar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Contar registros
  async count(filters = {}) {
    try {
      let query = this.db(this.tableName);

      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
          query = query.where(key, value);
        }
      });

      const result = await query.count('* as total');
      return result[0].total;
    } catch (error) {
      console.error(`Erro ao contar ${this.tableName}:`, error);
      throw error;
    }
  }

  // Buscar com paginação completa
  async findWithPagination(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const data = await this.findAll(filters, { limit, offset });
      const total = await this.count(filters);
      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error(`Erro na paginação ${this.tableName}:`, error);
      throw error;
    }
  }
}

module.exports = BaseModel;