import { Router } from 'express';
import { CmsController } from './cms.controller.js';

const router = Router();
const controller = new CmsController();

// ============================================================================
// HERO SECTION ROUTES
// ============================================================================

/**
 * @route   GET /cms/hero
 * @desc    Busca o conteúdo do Hero
 * @access  Public
 */
router.get('/hero', controller.getHero);

/**
 * @route   PUT /cms/hero
 * @desc    Atualiza o conteúdo do Hero
 * @access  Private/Admin
 */
router.put('/hero', controller.updateHero);

/**
 * @route   POST /cms/hero/reset
 * @desc    Reseta o Hero para valores padrão
 * @access  Private/Admin
 */
router.post('/hero/reset', controller.resetHero);

// ============================================================================
// MARQUEE MESSAGES ROUTES
// ============================================================================

/**
 * @route   GET /cms/marquee?activeOnly=true
 * @desc    Busca mensagens do marquee
 * @access  Public
 */
router.get('/marquee', controller.getMarqueeMessages);

/**
 * @route   GET /cms/marquee/:id
 * @desc    Busca uma mensagem específica
 * @access  Public
 */
router.get('/marquee/:id', controller.getMarqueeMessageById);

/**
 * @route   POST /cms/marquee
 * @desc    Cria uma nova mensagem
 * @access  Private/Admin
 */
router.post('/marquee', controller.createMarqueeMessage);

/**
 * @route   PUT /cms/marquee/:id
 * @desc    Atualiza uma mensagem
 * @access  Private/Admin
 */
router.put('/marquee/:id', controller.updateMarqueeMessage);

/**
 * @route   DELETE /cms/marquee/:id
 * @desc    Deleta uma mensagem
 * @access  Private/Admin
 */
router.delete('/marquee/:id', controller.deleteMarqueeMessage);

/**
 * @route   POST /cms/marquee/reorder
 * @desc    Reordena as mensagens
 * @access  Private/Admin
 */
router.post('/marquee/reorder', controller.reorderMarqueeMessages);

// ============================================================================
// FOOTER CONTENT ROUTES
// ============================================================================

/**
 * @route   GET /cms/footer
 * @desc    Busca o conteúdo do Footer
 * @access  Public
 */
router.get('/footer', controller.getFooter);

/**
 * @route   PUT /cms/footer
 * @desc    Atualiza o conteúdo do Footer
 * @access  Private/Admin
 */
router.put('/footer', controller.updateFooter);

/**
 * @route   POST /cms/footer/reset
 * @desc    Reseta o Footer para valores padrão
 * @access  Private/Admin
 */
router.post('/footer/reset', controller.resetFooter);

export default router;
