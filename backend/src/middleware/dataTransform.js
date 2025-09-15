// ========================================
// MIDDLEWARE DE TRANSFORMAÇÃO DE DADOS - MORIA BACKEND
// Sistema de transformação automática de tipos - Fase 4
// ========================================

const logger = require('../utils/logger');

class DataTransformer {
  // Transformar campos numéricos de string para number
  static transformNumericFields(fields = []) {
    return (req, res, next) => {
      if (!req.body) return next();

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          const value = req.body[field];

          if (typeof value === 'string') {
            const parsed = parseFloat(value);
            if (!isNaN(parsed)) {
              req.body[field] = parsed;
              logger.debug('Field transformed', {
                field,
                from: value,
                to: parsed,
                type: 'string->number'
              });
            }
          }
        }
      }

      next();
    };
  }

  // Transformar campos boolean
  static transformBooleanFields(fields = []) {
    return (req, res, next) => {
      if (!req.body) return next();

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          const value = req.body[field];

          if (typeof value === 'string') {
            req.body[field] = value.toLowerCase() === 'true';
          } else if (typeof value === 'number') {
            req.body[field] = value === 1;
          }
        }
      }

      next();
    };
  }

  // Limpar strings (trim, lowercase, etc.)
  static sanitizeStrings(fields = []) {
    return (req, res, next) => {
      if (!req.body) return next();

      for (const field of fields) {
        if (req.body[field] && typeof req.body[field] === 'string') {
          req.body[field] = req.body[field].trim();
        }
      }

      next();
    };
  }

  // Transformar arrays JSON
  static transformArrayFields(fields = []) {
    return (req, res, next) => {
      if (!req.body) return next();

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          const value = req.body[field];

          // Se for string, tentar fazer parse JSON
          if (typeof value === 'string') {
            try {
              req.body[field] = JSON.parse(value);
              logger.debug('Array field parsed', {
                field,
                from: value,
                to: req.body[field]
              });
            } catch (error) {
              logger.warn('Failed to parse array field', {
                field,
                value,
                error: error.message
              });
            }
          }

          // Garantir que é um array
          if (!Array.isArray(req.body[field])) {
            req.body[field] = [];
          }
        }
      }

      next();
    };
  }

  // Transformar campos de objeto JSON
  static transformObjectFields(fields = []) {
    return (req, res, next) => {
      if (!req.body) return next();

      for (const field of fields) {
        if (req.body[field] !== undefined) {
          const value = req.body[field];

          // Se for string, tentar fazer parse JSON
          if (typeof value === 'string') {
            try {
              req.body[field] = JSON.parse(value);
              logger.debug('Object field parsed', {
                field,
                from: value,
                to: req.body[field]
              });
            } catch (error) {
              logger.warn('Failed to parse object field', {
                field,
                value,
                error: error.message
              });
            }
          }

          // Garantir que é um objeto
          if (typeof req.body[field] !== 'object' || req.body[field] === null) {
            req.body[field] = {};
          }
        }
      }

      next();
    };
  }

  // Middleware específico para produtos
  static productTransform() {
    return (req, res, next) => {
      const numericFields = ['price', 'original_price', 'sale_price', 'cost_price', 'stock', 'min_stock'];
      const booleanFields = ['is_active', 'is_favorite'];
      const stringFields = ['name', 'description', 'category', 'sku', 'supplier'];
      const arrayFields = ['images', 'vehicle_compatibility'];
      const objectFields = ['specifications'];

      // Aplicar transformações em sequência
      DataTransformer.transformNumericFields(numericFields)(req, res, () => {
        DataTransformer.transformBooleanFields(booleanFields)(req, res, () => {
          DataTransformer.sanitizeStrings(stringFields)(req, res, () => {
            DataTransformer.transformArrayFields(arrayFields)(req, res, () => {
              DataTransformer.transformObjectFields(objectFields)(req, res, next);
            });
          });
        });
      });
    };
  }

  // Middleware específico para serviços
  static serviceTransform() {
    return (req, res, next) => {
      const numericFields = ['price', 'cost_price', 'bookings_count'];
      const booleanFields = ['is_active'];
      const stringFields = ['name', 'description', 'category'];
      const arrayFields = ['required_items'];
      const objectFields = ['specifications'];

      DataTransformer.transformNumericFields(numericFields)(req, res, () => {
        DataTransformer.transformBooleanFields(booleanFields)(req, res, () => {
          DataTransformer.sanitizeStrings(stringFields)(req, res, () => {
            DataTransformer.transformArrayFields(arrayFields)(req, res, () => {
              DataTransformer.transformObjectFields(objectFields)(req, res, next);
            });
          });
        });
      });
    };
  }

  // Middleware específico para usuários
  static userTransform() {
    return (req, res, next) => {
      const booleanFields = ['is_active'];
      const stringFields = ['name', 'email', 'role'];

      DataTransformer.transformBooleanFields(booleanFields)(req, res, () => {
        DataTransformer.sanitizeStrings(stringFields)(req, res, next);
      });
    };
  }

  // Middleware para pedidos
  static orderTransform() {
    return (req, res, next) => {
      const numericFields = ['total_amount', 'discount_amount'];
      const stringFields = ['status', 'customer_name'];
      const arrayFields = ['items'];

      DataTransformer.transformNumericFields(numericFields)(req, res, () => {
        DataTransformer.sanitizeStrings(stringFields)(req, res, () => {
          DataTransformer.transformArrayFields(arrayFields)(req, res, next);
        });
      });
    };
  }

  // Middleware universal para transformação baseada em schema
  static universal(schema = {}) {
    return (req, res, next) => {
      if (!req.body) return next();

      Object.keys(schema).forEach(field => {
        const fieldType = schema[field];
        const value = req.body[field];

        if (value !== undefined) {
          switch (fieldType) {
            case 'number':
              if (typeof value === 'string') {
                const parsed = parseFloat(value);
                if (!isNaN(parsed)) {
                  req.body[field] = parsed;
                }
              }
              break;

            case 'boolean':
              if (typeof value === 'string') {
                req.body[field] = value.toLowerCase() === 'true';
              } else if (typeof value === 'number') {
                req.body[field] = value === 1;
              }
              break;

            case 'string':
              if (typeof value === 'string') {
                req.body[field] = value.trim();
              }
              break;

            case 'array':
              if (typeof value === 'string') {
                try {
                  req.body[field] = JSON.parse(value);
                } catch {
                  req.body[field] = [];
                }
              }
              if (!Array.isArray(req.body[field])) {
                req.body[field] = [];
              }
              break;

            case 'object':
              if (typeof value === 'string') {
                try {
                  req.body[field] = JSON.parse(value);
                } catch {
                  req.body[field] = {};
                }
              }
              if (typeof req.body[field] !== 'object' || req.body[field] === null) {
                req.body[field] = {};
              }
              break;
          }
        }
      });

      logger.debug('Universal transform applied', {
        schema,
        transformed: req.body
      });

      next();
    };
  }
}

module.exports = DataTransformer;