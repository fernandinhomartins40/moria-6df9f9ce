// ========================================
// AUTH ROUTES - MORIA BACKEND
// Rotas de autenticação
// ========================================

const express = require('express');
const Joi = require('joi');
const { validate } = require('../utils/validations.js');
const { userValidation } = require('../utils/validations.js');
const { authenticateToken, requireAdmin } = require('../middleware/auth.js');
const AuthController = require('../controllers/AuthController.js');

const router = express.Router();

// Rotas públicas (sem autenticação)
router.post('/register',
  validate(userValidation.create, 'body'),
  AuthController.register
);

router.post('/login',
  validate(userValidation.login, 'body'),
  AuthController.login
);

router.post('/refresh',
  AuthController.refreshToken
);

// Rotas protegidas (requer autenticação)
router.use(authenticateToken); // Todas as rotas abaixo requerem autenticação

router.get('/profile',
  AuthController.getProfile
);

router.put('/profile',
  validate(userValidation.update, 'body'),
  AuthController.updateProfile
);

router.put('/change-password',
  validate(Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }), 'body'),
  AuthController.changePassword
);

router.post('/logout',
  AuthController.logout
);

// Rotas administrativas
router.use(requireAdmin); // Todas as rotas abaixo requerem admin

router.get('/users',
  AuthController.listUsers
);

router.put('/users/:id',
  validate(userValidation.update, 'body'),
  AuthController.updateUser
);

module.exports = router;