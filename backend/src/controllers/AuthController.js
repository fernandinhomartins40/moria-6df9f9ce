// ========================================
// AUTH CONTROLLER - MORIA BACKEND
// Controlador de autenticação
// ========================================

const User = require('../models/User.js');
const { generateToken, generateRefreshToken } = require('../middleware/auth.js');
const { asyncHandler, AppError } = require('../middleware/errorHandler.js');
const { validateUserData } = require('../utils/validators.js');
const env = require('../config/environment.js');

// Registrar novo usuário
const register = asyncHandler(async (req, res) => {
  // Validar dados de entrada
  const validation = validateUserData(req.body);

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: validation.errors
    });
  }

  const userData = validation.data;

  // Verificar se usuário já existe
  const existingUser = await User.findByEmail(userData.email);
  if (existingUser) {
    throw new AppError('Email já cadastrado no sistema', 409);
  }

  // Completar dados do usuário
  const completeUserData = {
    ...userData,
    role: 'customer', // Padrão
    is_active: true
  };

  const newUser = await User.create(completeUserData);

  // Gerar tokens
  const token = generateToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  // Remover senha da resposta
  const { password: _, ...userResponse } = newUser;

  res.status(201).json({
    success: true,
    message: 'Usuário cadastrado com sucesso',
    data: {
      user: userResponse,
      token,
      refreshToken
    }
  });
});

// Login do usuário
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validação simples para login
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: 'Senha é obrigatória'
    });
  }

  // Buscar usuário por email
  const user = await User.findByEmail(email.trim());
  if (!user) {
    throw new AppError('Email ou senha incorretos', 401);
  }

  if (!user.is_active) {
    throw new AppError('Conta inativa. Entre em contato com o suporte.', 401);
  }

  // Verificar senha
  const isValidPassword = await User.verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Email ou senha incorretos', 401);
  }

  // Gerar tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Atualizar último login
  await User.updateLastLogin(user.id);

  // Remover senha da resposta
  const { password: _, ...userResponse } = user;

  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user: userResponse,
      token,
      refreshToken
    }
  });
});

// Obter perfil do usuário logado
const getProfile = asyncHandler(async (req, res) => {
  // req.user já está disponível pelo middleware authenticateToken
  const { password, ...userResponse } = req.user;

  res.json({
    success: true,
    data: {
      user: userResponse
    }
  });
});

// Atualizar perfil do usuário
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Validar dados de entrada para atualização
  const validation = validateUserData(req.body, { isUpdate: true });

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: validation.errors
    });
  }

  const updateData = validation.data;

  // Se está tentando alterar email, verificar duplicação
  if (updateData.email && updateData.email !== req.user.email) {
    const existingUser = await User.findByEmail(updateData.email);
    if (existingUser) {
      throw new AppError('Email já está em uso por outro usuário', 409);
    }
  }

  // Não permitir alteração de role via este endpoint
  delete updateData.role;
  delete updateData.is_active;

  // Atualizar usuário
  const updatedUser = await User.update(userId, updateData);

  if (!updatedUser) {
    throw new AppError('Erro ao atualizar perfil', 500);
  }

  // Remover senha da resposta
  const { password, ...userResponse } = updatedUser;

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: {
      user: userResponse
    }
  });
});

// Alterar senha
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validação simples dos campos
  if (!currentPassword) {
    return res.status(400).json({
      success: false,
      message: 'Senha atual é obrigatória'
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Nova senha é obrigatória'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Nova senha deve ter pelo menos 6 caracteres'
    });
  }

  // Verificar senha atual
  const user = await User.findById(userId, true); // incluir password_hash
  const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new AppError('Senha atual incorreta', 400);
  }

  // Atualizar senha
  await User.update(userId, { password: newPassword });

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token requerido', 400);
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, env.get('JWT_SECRET'));

    if (decoded.type !== 'refresh') {
      throw new AppError('Token inválido', 401);
    }

    // Verificar se usuário ainda existe e está ativo
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new AppError('Usuário não encontrado ou inativo', 401);
    }

    // Gerar novos tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw new AppError('Refresh token inválido ou expirado', 401);
  }
});

// Logout (opcional - apenas resposta de sucesso)
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Listar usuários (admin apenas)
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, role, is_active } = req.query;

  const filters = {};
  if (search) {
    // Buscar por nome ou email
    filters.search = search;
  }
  if (role) {
    filters.role = role;
  }
  if (is_active !== undefined) {
    filters.is_active = is_active === 'true';
  }

  const result = await User.findWithPagination(filters, parseInt(page), parseInt(limit));

  // Remover senhas das respostas
  result.data = result.data.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination
  });
});

// Atualizar usuário (admin)
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validar dados de entrada para atualização
  const validation = validateUserData(req.body, { isUpdate: true });

  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Dados de entrada inválidos',
      errors: validation.errors
    });
  }

  const updateData = validation.data;

  // Verificar se usuário existe
  const user = await User.findById(id);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  // Verificar duplicação de email
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findByEmail(updateData.email);
    if (existingUser) {
      throw new AppError('Email já está em uso por outro usuário', 409);
    }
  }

  // Atualizar usuário
  const updatedUser = await User.update(id, updateData);

  // Remover senha da resposta
  const { password, ...userResponse } = updatedUser;

  res.json({
    success: true,
    message: 'Usuário atualizado com sucesso',
    data: {
      user: userResponse
    }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  listUsers,
  updateUser
};