// ========================================
// SETTINGS ROUTES - MORIA BACKEND
// Rotas de configurações do sistema
// ========================================

const express = require('express');
const { validate } = require('../utils/validations.js');
const { idSchema } = require('../utils/validations.js');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const SettingController = require('../controllers/SettingController.js');
const Joi = require('joi');

const router = express.Router();

// Validações
const settingValidation = {
  create: Joi.object({
    key: Joi.string().required().min(1).max(100),
    value: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    category: Joi.string().default('general').max(50),
    type: Joi.string().valid('string', 'number', 'boolean', 'json', 'text').default('string'),
    is_public: Joi.boolean().default(false),
    is_editable: Joi.boolean().default(true)
  }),
  update: Joi.object({
    key: Joi.string().min(1).max(100),
    value: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    category: Joi.string().max(50),
    type: Joi.string().valid('string', 'number', 'boolean', 'json', 'text'),
    is_public: Joi.boolean(),
    is_editable: Joi.boolean()
  }),
  updateValue: Joi.object({
    value: Joi.string().allow('', null).required()
  }),
  upsert: Joi.object({
    key: Joi.string().required().min(1).max(100),
    value: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    category: Joi.string().default('general').max(50),
    type: Joi.string().valid('string', 'number', 'boolean', 'json', 'text').default('string'),
    is_public: Joi.boolean().default(false),
    is_editable: Joi.boolean().default(true)
  })
};

// Rotas públicas (sem autenticação)
router.get('/public',
  SettingController.getPublicSettings
);

router.get('/company-info',
  SettingController.getCompanyInfo
);

router.get('/category/:category',
  SettingController.getSettingsByCategory
);

// Rotas administrativas (requer autenticação e admin)
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/',
  SettingController.getAllSettings
);

router.get('/:id',
  validate({ id: idSchema }, 'params'),
  SettingController.getSettingByKey
);

router.post('/',
  validate(settingValidation.create, 'body'),
  SettingController.createSetting
);

router.put('/:id',
  validate({ id: idSchema }, 'params'),
  validate(settingValidation.update, 'body'),
  SettingController.updateSetting
);

router.patch('/key/:key',
  validate(settingValidation.updateValue, 'body'),
  SettingController.updateSettingByKey
);

router.post('/upsert',
  validate(settingValidation.upsert, 'body'),
  SettingController.upsertSetting
);

router.delete('/:id',
  validate({ id: idSchema }, 'params'),
  SettingController.deleteSetting
);

module.exports = router;