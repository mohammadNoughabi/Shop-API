import ticketService from './ticket.service.ts';

import type { Request, Response } from 'express';

class TicketController {
  async getById(req: Request, res: Response): Promise<Response> {
    const id = req.params.id as string;
    const result = await ticketService.getTicketById(id);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async getByUserId(req: Request, res: Response): Promise<Response> {
    const userId = req.user._id as string;
    const result = await ticketService.getUserTickets(userId);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async create(req: Request, res: Response): Promise<Response> {
    const { title, description } = req.body;
    const userId = req.user._id;
    const result = await ticketService.createTicket({
      title,
      description,
      userId,
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async addMessage(req: Request, res: Response): Promise<Response> {
    const { ticketId, message, attachments } = req.body;
    const senderId = req.user._id;
    const result = await ticketService.addMessage({
      ticketId,
      senderId,
      message,
      attachments,
    });
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }

  async closeTicket(req: Request, res: Response): Promise<Response> {
    const ticketId = req.params.id as string;
    const result = await ticketService.closeTicket(ticketId);
    if (!result.success) {
      return res.status(result.statusCode || 500).json(result);
    }
    return res.status(result.statusCode || 200).json(result);
  }
}

export default new TicketController();
