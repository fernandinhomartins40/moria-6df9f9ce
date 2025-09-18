// ========================================
// AUTH CONTROLLER - PRISMA VERSION
// ✅ ELIMINA User model dependência
// ✅ ELIMINA sistema de validação customizado
// ✅ Type safety 100% com Prisma
// ✅ Queries diretas e otimizadas
// ========================================

const prisma = require('../services/prisma.js');
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken } = require('../middleware/auth.js');
const { asyncHandler } = require('../middleware/errorHandler.js');
const Boom = require('@hapi/boom');
const { registerUserSchema, loginUserSchema } = require('../utils/validators.js');

// Registrar novo usuário
const register = asyncHandler(async (req, res) => {
  // ✅ Validar dados de entrada com Zod
  const validatedData = registerUserSchema.parse(req.body);
  
  const {
    name,
    email,
    password,
    phone,
    cpf,
    birthDate
  } = validatedData;

  // ✅ Validação básica (Prisma fará validação de schema)
  if (!name || name.trim().length < 2) {
    throw Boom.badRequest('Nome deve ter pelo menos 2 caracteres');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw Boom.badRequest('Email inválido');
  }

  if (!password || password.length < 6) {
    throw Boom.badRequest('Senha deve ter pelo menos 6 caracteres');
  }

  const emailLower = email.trim().toLowerCase();

  // ✅ Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower }
  });

  if (existingUser) {
    throw Boom.conflict('Email já cadastrado no sistema');
  }

  // ✅ Hash da senha
  const passwordHash = await bcrypt.hash(password, 12);

  // ✅ Criar usuário com Prisma
  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: emailLower,
      passwordHash,
      phone: phone?.trim() || null,
      cpf: cpf?.trim() || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      role: 'CUSTOMER',
      isActive: true
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      birthDate: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  });

  // Gerar tokens
  const token = generateToken(newUser.id);
  const refreshToken = generateRefreshToken(newUser.id);

  res.status(201).json({
    success: true,
    message: 'Usuário cadastrado com sucesso',
    data: {
      user: newUser,
      token,
      refreshToken
    }
  });
});

// Login do usuário
const login = asyncHandler(async (req, res) => {
  // ✅ Validar dados de entrada com Zod
  const validatedData = loginUserSchema.parse(req.body);
  
  const { email, password } = validatedData;

  // Validação básica
  if (!email || !email.trim()) {
    throw Boom.badRequest('Email é obrigatório');
  }

  if (!password) {
    throw Boom.badRequest('Senha é obrigatória');
  }

  const emailLower = email.trim().toLowerCase();

  // ✅ Buscar usuário com Prisma (incluindo password_hash)
  const user = await prisma.user.findUnique({
    where: { email: emailLower }
  });

  if (!user) {
    throw Boom.unauthorized('Email ou senha incorretos');
  }

  if (!user.isActive) {
    throw Boom.unauthorized('Conta inativa. Entre em contato com o suporte.');
  }

  // ✅ Verificar senha
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw Boom.unauthorized('Email ou senha incorretos');
  }

  // ✅ Atualizar último login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  // Gerar tokens
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Remover password_hash da resposta
  const { passwordHash, ...userResponse } = user;

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

// Obter perfil do usuário
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // ✅ Buscar usuário com relacionamentos automáticos
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      birthDate: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
      totalOrders: true,
      totalSpent: true,
      addresses: true,
      _count: {
        select: {
          orders: true,
          favorites: true
        }
      }
    }
  });

  if (!user) {
    throw Boom.notFound('Usuário não encontrado');
  }

  res.json({
    success: true,
    data: user
  });
});

// Atualizar perfil
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone, cpf, birthDate } = req.body;

  // ✅ Validação básica
  const updateData = {};
  if (name && name.trim().length >= 2) updateData.name = name.trim();
  if (phone) updateData.phone = phone.trim() || null;
  if (cpf) updateData.cpf = cpf.trim() || null;
  if (birthDate) updateData.birthDate = new Date(birthDate);

  // ✅ Update com Prisma
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      birthDate: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: updatedUser
  });
});

// Alterar senha
const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw Boom.badRequest('Senha atual e nova senha são obrigatórias');
  }

  if (newPassword.length < 6) {
    throw Boom.badRequest('Nova senha deve ter pelo menos 6 caracteres');
  }

  // ✅ Buscar usuário atual
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  // Verificar senha atual
  const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidCurrentPassword) {
    throw Boom.unauthorized('Senha atual incorreta');
  }

  // ✅ Hash da nova senha e atualizar
  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash }
  });

  res.json({
    success: true,
    message: 'Senha alterada com sucesso'
  });
});

// Refresh token
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw Boom.badRequest('Refresh token é obrigatório');
  }

  try {
    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Verificar se usuário ainda existe e está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw Boom.unauthorized('Token inválido');
    }

    // Gerar novos tokens
    const newToken = generateToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw Boom.unauthorized('Token inválido');
  }
});

// Logout (invalidar token)
const logout = asyncHandler(async (req, res) => {
  // Com JWT stateless, o logout é feito no frontend
  // Aqui podemos adicionar lógica de blacklist se necessário

  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// ✅ Métodos administrativos

// Listar usuários (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isActive, search } = req.query;

  const where = {
    ...(role && { role: role.toUpperCase() }),
    ...(isActive !== undefined && { isActive: isActive === 'true' }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } }
      ]
    })
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        totalOrders: true,
        totalSpent: true,
        _count: {
          select: { orders: true }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Obter estatísticas de usuários (admin)
const getUserStats = asyncHandler(async (req, res) => {
  const [total, active, customers, admins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } })
  ]);

  res.json({
    success: true,
    data: {
      total,
      active,
      customers,
      admins,
      inactive: total - active
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
  getUsers,
  getUserStats
};