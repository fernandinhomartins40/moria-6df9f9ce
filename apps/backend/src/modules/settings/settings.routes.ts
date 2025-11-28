import { Router } from 'express';
import { SettingsController } from './settings.controller.js';

const router = Router();
const controller = new SettingsController();

/**
 * @route   GET /settings
 * @desc    Busca as configurações da loja
 * @access  Public (mas deveria ser Private/Admin em produção)
 */
router.get('/', controller.getSettings);

/**
 * @route   PUT /settings
 * @desc    Atualiza as configurações da loja
 * @access  Private/Admin
 */
router.put('/', controller.updateSettings);

/**
 * @route   POST /settings/reset
 * @desc    Reseta as configurações para valores padrão
 * @access  Private/Admin
 */
router.post('/reset', controller.resetSettings);

export default router;
