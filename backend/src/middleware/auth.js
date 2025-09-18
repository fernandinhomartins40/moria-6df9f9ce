// ========================================
// AUTH MIDDLEWARE - MORIA BACKEND
// Middleware de autenticação JWT
// ========================================

const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma.js');
const env = require('../config/environment.js');
const { error, info } = require('../utils/logger');

// Cache para tokens inválidos/revogados (simple in-memory cache)
const revokedTokens = new Set();

// Middleware de rate limiting (simplificado)
const rateLimit = (req, res, next) => {
  // Rate limiting será tratado por middleware externo (proxy/Redis)
  next();
};

// Middleware de autenticação JWT aprimorado
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar se token foi revogado
    if (revokedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: 'Token revogado'
      });
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, env.get('JWT_SECRET'));

    // Verificar issuer para maior segurança
    if (decoded.iss !== 'moria-backend') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - issuer incorreto'
      });
    }

    // Buscar usuário no banco com Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário inativo'
      });
    }

    // Adicionar usuário na requisição
    req.user = user;
    req.token = token; // Para possível revogação posterior
    next();
  } catch (error) {
    const errorType = error.name;
    const clientIP = req.ip || req.connection.remoteAddress;

    error(`Erro na autenticação [${clientIP}]:`, { error: error.message });

    if (errorType === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (errorType === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (errorType === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token ainda não é válido'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware de autorização (só administradores)
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

// Middleware para usuário opcional (não obrigatório estar logado)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, env.get('JWT_SECRET'));
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    req.user = user && user.isActive ? user : null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    env.get('JWT_SECRET'),
    {
      expiresIn: env.get('JWT_EXPIRES_IN'),
      issuer: 'moria-backend'
    }
  );
};

// Gerar refresh token (válido por mais tempo)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    env.get('JWT_SECRET'),
    {
      expiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN'),
      issuer: 'moria-backend'
    }
  );
};

// Função para revogar token
const revokeToken = (token) => {
  revokedTokens.add(token);

  // Limpar tokens revogados antigas (cleanup simples)
  if (revokedTokens.size > 1000) {
    const tokensArray = Array.from(revokedTokens);
    const toRemove = tokensArray.slice(0, 500);
    toRemove.forEach(t => revokedTokens.delete(t));
  }

  info(`Token revogado. Total de tokens revogados: ${revokedTokens.size}`);
};

// Função para limpar rate limit de um IP específico (admin)
const clearRateLimit = (ip) => {
  rateLimitMap.delete(ip);
  info(`Rate limit limpo para IP: ${ip}`);
};

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  rateLimit,
  revokeToken,
  clearRateLimit
};