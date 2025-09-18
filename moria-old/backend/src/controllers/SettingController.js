// ========================================
// SETTING CONTROLLER - PRISMA VERSION
// ✅ ELIMINA Setting model dependência
// ✅ Type safety 100% com Prisma
// ✅ Queries otimizadas e upsert automático
// ========================================

const prisma = require('../services/prisma.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Obter configurações públicas
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
    select: {
      key: true,
      value: true,
      category: true,
      description: true
    },
    orderBy: [
      { category: 'asc' },
      { key: 'asc' }
    ]
  });

  // ✅ Transformar em objeto chave-valor para facilitar uso
  const settingsObject = settings.reduce((acc, setting) => {
    acc[setting.key] = {
      value: setting.value,
      category: setting.category,
      description: setting.description
    };
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      settings: settingsObject,
      raw: settings // Manter array original também
    }
  });
});

// Obter informações da empresa
const getCompanyInfo = asyncHandler(async (req, res) => {
  const companySettings = await prisma.setting.findMany({
    where: {
      category: 'COMPANY',
      isPublic: true
    },
    select: {
      key: true,
      value: true
    }
  });

  const companyInfo = companySettings.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});

  res.json({
    success: true,
    data: companyInfo
  });
});

// Obter todas as configurações (admin)
const getAllSettings = asyncHandler(async (req, res) => {
  const { category, isPublic, isEditable } = req.query;

  const where = {
    ...(category && { category: category.toUpperCase() }),
    ...(isPublic !== undefined && { isPublic: isPublic === 'true' }),
    ...(isEditable !== undefined && { isEditable: isEditable === 'true' })
  };

  const settings = await prisma.setting.findMany({
    where,
    orderBy: [
      { category: 'asc' },
      { key: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: settings
  });
});

// Obter configuração por chave (admin)
const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await prisma.setting.findUnique({
    where: { key }
  });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  res.json({
    success: true,
    data: setting
  });
});

// Criar configuração (admin)
const createSetting = asyncHandler(async (req, res) => {
  const {
    key,
    value,
    category = 'GENERAL',
    type = 'STRING',
    description,
    isPublic = false,
    isEditable = true
  } = req.body;

  // ✅ Validação básica
  if (!key || !key.trim()) {
    throw new AppError('Chave é obrigatória', 400);
  }

  if (value === undefined || value === null) {
    throw new AppError('Valor é obrigatório', 400);
  }

  // ✅ Verificar se a chave já existe
  const existing = await prisma.setting.findUnique({
    where: { key: key.trim().toUpperCase() }
  });

  if (existing) {
    throw new AppError('Configuração com esta chave já existe', 409);
  }

  // ✅ Criar configuração
  const newSetting = await prisma.setting.create({
    data: {
      key: key.trim().toUpperCase(),
      value: String(value),
      category: category.toUpperCase(),
      type: type.toUpperCase(),
      description: description?.trim() || null,
      isPublic,
      isEditable
    }
  });

  res.status(201).json({
    success: true,
    message: 'Configuração criada com sucesso',
    data: newSetting
  });
});

// Atualizar configuração (admin)
const updateSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { value, description, isPublic, isEditable } = req.body;

  const setting = await prisma.setting.findUnique({
    where: { id: parseInt(id) }
  });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  if (!setting.isEditable) {
    throw new AppError('Esta configuração não pode ser editada', 403);
  }

  // ✅ Update apenas campos permitidos
  const updateData = {};
  if (value !== undefined) updateData.value = String(value);
  if (description !== undefined) updateData.description = description?.trim() || null;
  if (isPublic !== undefined) updateData.isPublic = Boolean(isPublic);
  if (isEditable !== undefined) updateData.isEditable = Boolean(isEditable);

  const updatedSetting = await prisma.setting.update({
    where: { id: parseInt(id) },
    data: updateData
  });

  res.json({
    success: true,
    message: 'Configuração atualizada com sucesso',
    data: updatedSetting
  });
});

// Atualizar configuração por chave (admin)
const updateSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined || value === null) {
    throw new AppError('Valor é obrigatório', 400);
  }

  const setting = await prisma.setting.findUnique({
    where: { key: key.toUpperCase() }
  });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  if (!setting.isEditable) {
    throw new AppError('Esta configuração não pode ser editada', 403);
  }

  // ✅ Update por chave
  const updatedSetting = await prisma.setting.update({
    where: { key: key.toUpperCase() },
    data: { value: String(value) }
  });

  res.json({
    success: true,
    message: 'Configuração atualizada com sucesso',
    data: updatedSetting
  });
});

// Criar ou atualizar configuração (upsert)
const upsertSetting = asyncHandler(async (req, res) => {
  const {
    key,
    value,
    category = 'GENERAL',
    type = 'STRING',
    description,
    isPublic = false,
    isEditable = true
  } = req.body;

  if (!key || !key.trim()) {
    throw new AppError('Chave é obrigatória', 400);
  }

  if (value === undefined || value === null) {
    throw new AppError('Valor é obrigatório', 400);
  }

  // ✅ Upsert automático com Prisma
  const setting = await prisma.setting.upsert({
    where: { key: key.trim().toUpperCase() },
    update: {
      value: String(value),
      ...(description !== undefined && { description: description?.trim() || null }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isEditable !== undefined && { isEditable })
    },
    create: {
      key: key.trim().toUpperCase(),
      value: String(value),
      category: category.toUpperCase(),
      type: type.toUpperCase(),
      description: description?.trim() || null,
      isPublic,
      isEditable
    }
  });

  res.json({
    success: true,
    message: 'Configuração salva com sucesso',
    data: setting
  });
});

// Deletar configuração (admin)
const deleteSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const setting = await prisma.setting.findUnique({
    where: { id: parseInt(id) }
  });

  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  if (!setting.isEditable) {
    throw new AppError('Esta configuração não pode ser removida', 403);
  }

  await prisma.setting.delete({
    where: { id: parseInt(id) }
  });

  res.json({
    success: true,
    message: 'Configuração removida com sucesso'
  });
});

// Obter configurações por categoria
const getSettingsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { publicOnly } = req.query;

  const where = {
    category: category.toUpperCase(),
    ...(publicOnly === 'true' && { isPublic: true })
  };

  const settings = await prisma.setting.findMany({
    where,
    orderBy: { key: 'asc' }
  });

  res.json({
    success: true,
    data: settings
  });
});

// Obter estatísticas de configurações (admin)
const getSettingStats = asyncHandler(async (req, res) => {
  const [
    total,
    publicSettings,
    editableSettings,
    categories
  ] = await Promise.all([
    prisma.setting.count(),
    prisma.setting.count({ where: { isPublic: true } }),
    prisma.setting.count({ where: { isEditable: true } }),
    prisma.setting.groupBy({
      by: ['category'],
      _count: { _all: true },
      orderBy: { category: 'asc' }
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      public: publicSettings,
      private: total - publicSettings,
      editable: editableSettings,
      readOnly: total - editableSettings,
      categories: categories.map(cat => ({
        category: cat.category,
        count: cat._count._all
      }))
    }
  });
});

// Backup/Export configurações (admin)
const exportSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.setting.findMany({
    orderBy: [
      { category: 'asc' },
      { key: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: {
      exported_at: new Date().toISOString(),
      count: settings.length,
      settings
    }
  });
});

module.exports = {
  getPublicSettings,
  getCompanyInfo,
  getAllSettings,
  getSettingByKey,
  createSetting,
  updateSetting,
  updateSettingByKey,
  upsertSetting,
  deleteSetting,
  getSettingsByCategory,
  getSettingStats,
  exportSettings
};