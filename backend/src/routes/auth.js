// ========================================
// AUTH ROUTES - MORIA BACKEND
// Rotas de autenticação
// ========================================

const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');
const AuthController = require('../controllers/AuthController.js');
const rateLimiter = require('../middleware/rateLimiter.js');
const DataTransformer = require('../middleware/dataTransform.js');

const router = express.Router();

// Rotas públicas (sem autenticação) com rate limiting específico
router.post('/register',
  rateLimiter.auth(),
  DataTransformer.userTransform(),
  AuthController.register
);

router.post('/login',
  rateLimiter.auth(),
  AuthController.login
);

router.post('/refresh',
  rateLimiter.auth(),
  AuthController.refreshToken
);

// Rotas protegidas (requer autenticação)
router.use(authenticateToken); // Todas as rotas abaixo requerem autenticação

router.get('/profile',
  AuthController.getProfile
);

router.put('/profile',
  AuthController.updateProfile
);

router.put('/change-password',
  AuthController.changePassword
);

router.post('/logout',
  AuthController.logout
);

// Rotas administrativas com rate limiting específico
router.use(requireAdmin); // Todas as rotas abaixo requerem admin
router.use(rateLimiter.admin()); // Rate limiting para administradores

router.get('/users',
  AuthController.listUsers
);

router.put('/users/:id',
  AuthController.updateUser
);

module.exports = router;