// ========================================
// SETTING MODEL - MORIA BACKEND
// Model para configurações do sistema
// ========================================

const BaseModel = require('./BaseModel.js');

class Setting extends BaseModel {
  constructor() {
    super('settings');
  }

  // Buscar configuração por chave
  async findByKey(key) {
    try {
      return await this.findOne({ key });
    } catch (error) {
      console.error('Erro ao buscar configuração por chave:', error);
      throw error;
    }
  }

  // Buscar configurações por categoria
  async findByCategory(category) {
    try {
      return await this.findAll({ category });
    } catch (error) {
      console.error('Erro ao buscar configurações por categoria:', error);
      throw error;
    }
  }

  // Buscar configurações públicas
  async findPublic() {
    try {
      return await this.findAll({ is_public: true });
    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      throw error;
    }
  }

  // Buscar configurações públicas por categoria
  async findPublicByCategory(category) {
    try {
      return await this.findAll({ category, is_public: true });
    } catch (error) {
      console.error('Erro ao buscar configurações públicas por categoria:', error);
      throw error;
    }
  }

  // Atualizar configuração por chave
  async updateByKey(key, value) {
    try {
      const setting = await this.findByKey(key);
      if (!setting) {
        throw new Error(`Configuração '${key}' não encontrada`);
      }

      if (!setting.is_editable) {
        throw new Error(`Configuração '${key}' não é editável`);
      }

      return await this.update(setting.id, { value });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      throw error;
    }
  }

  // Criar ou atualizar configuração
  async upsert(key, value, options = {}) {
    try {
      const existing = await this.findByKey(key);

      if (existing) {
        return await this.update(existing.id, { value });
      } else {
        return await this.create({
          key,
          value,
          description: options.description || null,
          category: options.category || 'general',
          type: options.type || 'string',
          is_public: options.is_public || false,
          is_editable: options.is_editable !== undefined ? options.is_editable : true
        });
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar configuração:', error);
      throw error;
    }
  }

  // Obter configurações da empresa
  async getCompanyInfo() {
    try {
      const settings = await this.findPublicByCategory('company');

      // Converter para objeto com chaves diretas
      const companyInfo = {};
      settings.forEach(setting => {
        let value = setting.value;

        // Parse do valor conforme o tipo
        if (setting.type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Erro ao fazer parse do JSON da configuração ${setting.key}:`, e);
          }
        } else if (setting.type === 'boolean') {
          value = value === 'true' || value === '1' || value === 1;
        } else if (setting.type === 'number') {
          value = parseFloat(value);
        }

        companyInfo[setting.key] = value;
      });

      return companyInfo;
    } catch (error) {
      console.error('Erro ao obter informações da empresa:', error);
      throw error;
    }
  }

  // Obter todas as configurações públicas formatadas
  async getPublicSettings() {
    try {
      const settings = await this.findPublic();

      const formatted = {};
      settings.forEach(setting => {
        let value = setting.value;

        // Parse do valor conforme o tipo
        if (setting.type === 'json') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            console.warn(`Erro ao fazer parse do JSON da configuração ${setting.key}:`, e);
          }
        } else if (setting.type === 'boolean') {
          value = value === 'true' || value === '1' || value === 1;
        } else if (setting.type === 'number') {
          value = parseFloat(value);
        }

        formatted[setting.key] = value;
      });

      return formatted;
    } catch (error) {
      console.error('Erro ao obter configurações públicas:', error);
      throw error;
    }
  }
}

module.exports = new Setting();