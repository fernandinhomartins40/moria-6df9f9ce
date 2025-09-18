// ========================================
// SETTINGS ROUTES - MORIA BACKEND
// Rotas de configurações do sistema
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth.js');
const SettingController = require('../controllers/SettingController.js');

const router = express.Router();

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
  SettingController.getSettingByKey
);

router.post('/',
  SettingController.createSetting
);

router.put('/:id',
  SettingController.updateSetting
);

router.patch('/key/:key',
  SettingController.updateSettingByKey
);

router.post('/upsert',
  SettingController.upsertSetting
);

router.delete('/:id',
  SettingController.deleteSetting
);

module.exports = router;