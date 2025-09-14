// ========================================
// SETTING CONTROLLER - MORIA BACKEND
// Controlador de configurações do sistema
// ========================================

const Setting = require('../models/Setting.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');

// Obter configurações públicas
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.getPublicSettings();

  res.json({
    success: true,
    data: settings
  });
});

// Obter informações da empresa
const getCompanyInfo = asyncHandler(async (req, res) => {
  const companyInfo = await Setting.getCompanyInfo();

  res.json({
    success: true,
    data: companyInfo
  });
});

// Obter todas as configurações (admin)
const getAllSettings = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let settings;
  if (category) {
    settings = await Setting.findByCategory(category);
  } else {
    settings = await Setting.findAll();
  }

  res.json({
    success: true,
    data: settings
  });
});

// Obter configuração por chave (admin)
const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await Setting.findByKey(key);
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
  const settingData = req.body;

  // Verificar se a chave já existe
  const existing = await Setting.findByKey(settingData.key);
  if (existing) {
    throw new AppError('Configuração com esta chave já existe', 409);
  }

  const newSetting = await Setting.create(settingData);

  res.status(201).json({
    success: true,
    message: 'Configuração criada com sucesso',
    data: newSetting
  });
});

// Atualizar configuração (admin)
const updateSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const setting = await Setting.findById(id);
  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  if (!setting.is_editable) {
    throw new AppError('Esta configuração não pode ser editada', 403);
  }

  // Se tentando alterar chave, verificar duplicata
  if (updateData.key && updateData.key !== setting.key) {
    const existing = await Setting.findByKey(updateData.key);
    if (existing) {
      throw new AppError('Configuração com esta chave já existe', 409);
    }
  }

  const updatedSetting = await Setting.update(id, updateData);

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

  const updatedSetting = await Setting.updateByKey(key, value);

  res.json({
    success: true,
    message: 'Configuração atualizada com sucesso',
    data: updatedSetting
  });
});

// Deletar configuração (admin)
const deleteSetting = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const setting = await Setting.findById(id);
  if (!setting) {
    throw new AppError('Configuração não encontrada', 404);
  }

  if (!setting.is_editable) {
    throw new AppError('Esta configuração não pode ser removida', 403);
  }

  await Setting.delete(id);

  res.json({
    success: true,
    message: 'Configuração removida com sucesso'
  });
});

// Criar ou atualizar configuração (admin)
const upsertSetting = asyncHandler(async (req, res) => {
  const { key, value, ...options } = req.body;

  if (!key) {
    throw new AppError('Chave da configuração é obrigatória', 400);
  }

  const setting = await Setting.upsert(key, value, options);

  res.json({
    success: true,
    message: 'Configuração salva com sucesso',
    data: setting
  });
});

// Obter configurações por categoria
const getSettingsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const settings = await Setting.findByCategory(category);

  res.json({
    success: true,
    data: settings
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
  deleteSetting,
  upsertSetting,
  getSettingsByCategory
};