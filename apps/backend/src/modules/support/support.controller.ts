import { Request, Response } from 'express';
import { SupportService } from './support.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { CreateMessageDto } from './dto/create-message.dto.js';
import { RateTicketDto } from './dto/rate-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { validateDto } from '@shared/utils/validation.util.js';

declare global {
  namespace Express {
    interface Request {
      customer?: {
        id: string;
        email: string;
        name: string;
        status: string;
        level: string;
      };
    }
  }
}

const supportService = new SupportService();

export class SupportController {
  /**
   * POST /support/tickets - Criar ticket
   */
  async createTicket(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const dto = await validateDto(CreateTicketDto, req.body);

    const ticket = await supportService.createTicket(customerId, dto);

    res.status(201).json({
      success: true,
      data: ticket,
    });
  }

  /**
   * GET /support/tickets - Listar tickets do cliente
   */
  async getCustomerTickets(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { status, category, limit, offset } = req.query;

    const result = await supportService.getCustomerTickets(customerId, {
      status: status as any,
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  }

  /**
   * GET /support/tickets/:id - Detalhes do ticket
   */
  async getTicketById(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;

    const ticket = await supportService.getTicketById(id, customerId);

    res.json({
      success: true,
      data: ticket,
    });
  }

  /**
   * PATCH /support/tickets/:id - Atualizar ticket (reabrir)
   */
  async updateTicket(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;
    const dto = await validateDto(UpdateTicketDto, req.body);

    const ticket = await supportService.updateTicket(id, customerId, dto);

    res.json({
      success: true,
      data: ticket,
    });
  }

  /**
   * DELETE /support/tickets/:id - Fechar ticket
   */
  async closeTicket(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;

    const ticket = await supportService.closeTicket(id, customerId);

    res.json({
      success: true,
      data: ticket,
    });
  }

  /**
   * POST /support/tickets/:id/messages - Adicionar mensagem
   */
  async addMessage(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;
    const dto = await validateDto(CreateMessageDto, req.body);

    const message = await supportService.addMessage(id, customerId, dto);

    res.status(201).json({
      success: true,
      data: message,
    });
  }

  /**
   * GET /support/tickets/:id/messages - Listar mensagens
   */
  async getMessages(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;

    const ticket = await supportService.getTicketById(id, customerId);

    res.json({
      success: true,
      data: ticket.messages,
    });
  }

  /**
   * POST /support/tickets/:id/rating - Avaliar ticket
   */
  async rateTicket(req: Request, res: Response) {
    const customerId = req.customer!.id;
    const { id } = req.params;
    const dto = await validateDto(RateTicketDto, req.body);

    const ticket = await supportService.rateTicket(id, customerId, dto);

    res.json({
      success: true,
      data: ticket,
    });
  }

  /**
   * GET /support/stats - Estatísticas do cliente
   */
  async getCustomerStats(req: Request, res: Response) {
    const customerId = req.customer!.id;

    const stats = await supportService.getCustomerStats(customerId);

    res.json({
      success: true,
      data: stats,
    });
  }
}
