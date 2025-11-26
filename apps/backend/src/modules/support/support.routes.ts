import { Router, Request, Response } from 'express';
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
router.post('/tickets', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.createTicket(req, res)));
router.get('/tickets', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.getCustomerTickets(req, res)));
router.get('/tickets/:id', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.getTicketById(req, res)));
router.patch('/tickets/:id', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.updateTicket(req, res)));
router.delete('/tickets/:id', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.closeTicket(req, res)));

// Mensagens
router.post('/tickets/:id/messages', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.addMessage(req, res)));
router.get('/tickets/:id/messages', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.getMessages(req, res)));

// Avaliação
router.post('/tickets/:id/rating', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.rateTicket(req, res)));

// Estatísticas
router.get('/stats', authenticateCustomer, asyncHandler((req: Request, res: Response) => supportController.getCustomerStats(req, res)));

// FAQ (autenticado - para marcar como útil)
router.post('/faq/:id/helpful', authenticateCustomer, asyncHandler(faqController.markFAQHelpful));

export default router;
