import { Router } from 'express';
import { SupportController } from './support.controller.js';
import { FAQController } from './faq.controller.js';
import { SupportConfigController } from './support-config.controller.js';
import { authenticateCustomer } from '@middlewares/auth.middleware.js';
import { asyncHandler } from '@shared/utils/async-handler.util.js';

const router = Router();

const supportController = new SupportController();
const faqController = new FAQController();
const supportConfigController = new SupportConfigController();

// ============================================================================
// Rotas Públicas
// ============================================================================

// FAQ (público)
router.get('/faq', asyncHandler(faqController.getFAQCategories));
router.get('/faq/search', asyncHandler(faqController.searchFAQ));
router.post('/faq/:id/view', asyncHandler(faqController.incrementFAQView));

// Configurações (público)
router.get('/config', asyncHandler(supportConfigController.getSupportConfig));

// ============================================================================
// Rotas Protegidas (Cliente)
// ============================================================================

// Tickets
router.post('/tickets', authenticateCustomer, asyncHandler(supportController.createTicket));
router.get('/tickets', authenticateCustomer, asyncHandler(supportController.getCustomerTickets));
router.get('/tickets/:id', authenticateCustomer, asyncHandler(supportController.getTicketById));
router.patch('/tickets/:id', authenticateCustomer, asyncHandler(supportController.updateTicket));
router.delete('/tickets/:id', authenticateCustomer, asyncHandler(supportController.closeTicket));

// Mensagens
router.post('/tickets/:id/messages', authenticateCustomer, asyncHandler(supportController.addMessage));
router.get('/tickets/:id/messages', authenticateCustomer, asyncHandler(supportController.getMessages));

// Avaliação
router.post('/tickets/:id/rating', authenticateCustomer, asyncHandler(supportController.rateTicket));

// Estatísticas
router.get('/stats', authenticateCustomer, asyncHandler(supportController.getCustomerStats));

// FAQ (autenticado - para marcar como útil)
router.post('/faq/:id/helpful', authenticateCustomer, asyncHandler(faqController.markFAQHelpful));

export default router;
