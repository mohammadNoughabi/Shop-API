import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Ticket, { TicketMessage } from './ticket.model.ts';
import userService from '../user/user.service.ts';

import type {
  CreateTicketData,
  AddMessageData,
  GetTicketByIdResult,
  GetUserTicketsResult,
  CreateTicketResult,
  AddMessageResult,
  CloseTicketResult,
} from './ticket.interface.ts';
import type { TicketStatus } from './ticket.constants.ts';

class TicketService {
  async getTicketById(ticketId: string): Promise<GetTicketByIdResult> {
    const ticket = await Ticket.findOne({ id: ticketId })
      .populate('userId', 'username email') // Populate user details (username and email)
      .populate({
        path: 'messages',
        populate: {
          path: 'senderId',
          select: 'username email', // Populate sender details (username and email)
        },
      })
      .catch(() => null);

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: 'Ticket retrieved successfully',
      statusCode: 200,
      data: { ticket },
    };
  }

  async getUserTickets(userId: string): Promise<GetUserTicketsResult> {
    const existingUser = await userService.getUserProfile(userId);
    if (!existingUser.success) {
      return {
        success: false,
        message: 'User not found',
        statusCode: 404,
      };
    }
    const tickets = await Ticket.find({ userId })
      .populate('userId', 'username email')
      .populate({
        path: 'messages',
        populate: {
          path: 'senderId',
          select: 'username email',
        },
      })
      .catch(() => null);

    if (!tickets) {
      return {
        success: false,
        message: 'Failed to retrieve tickets',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Tickets retrieved successfully',
      statusCode: 200,
      data: { tickets },
    };
  }

  async createTicket(data: CreateTicketData): Promise<CreateTicketResult> {
    const { title, description, userId } = data;
    const id = uuidv4();

    const ticket = new Ticket({
      id,
      title,
      description,
      userId,
    });

    const createdTicket = await ticket.save().catch(() => null);

    if (!createdTicket) {
      return {
        success: false,
        message: 'Failed to create ticket',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Ticket created successfully',
      statusCode: 201,
      data: { ticket: createdTicket },
    };
  }

  async addMessage(data: AddMessageData): Promise<AddMessageResult> {
    const { ticketId, senderId, message, attachments } = data;
    const ticket = await Ticket.findOne({ id: ticketId }).catch(() => null);

    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
        statusCode: 404,
      };
    }

    const newMessage = new TicketMessage({
      id: uuidv4(),
      ticketId: new Types.ObjectId(ticketId),
      senderId,
      message,
      attachments,
    });
    ticket.messages.push(newMessage._id);

    const updatedTicket = await ticket.save().catch(() => null);
    if (!updatedTicket) {
      return {
        success: false,
        message: 'Failed to add message to ticket',
        statusCode: 500,
      };
    }

    return {
      success: true,
      message: 'Message added to ticket successfully',
      statusCode: 201,
      data: { message: newMessage },
    };
  }

  private async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<boolean> {
    const ticket = await Ticket.findOne({ id: ticketId }).catch(() => null);
    if (!ticket) {
      return false;
    }
    ticket.status = status;
    await ticket.save().catch(() => null);
    return true;
  }

  async closeTicket(ticketId: string): Promise<CloseTicketResult> {
    const ticket = await Ticket.findOne({ id: ticketId }).catch(() => null);
    if (!ticket) {
      return {
        success: false,
        message: 'Ticket not found',
        statusCode: 404,
      };
    }
    const isUpdated = await this.updateTicketStatus(ticketId, 'closed');
    if (!isUpdated) {
      return {
        success: false,
        message: 'Ticket not found or failed to update status',
        statusCode: 404,
      };
    }
    return {
      success: true,
      message: 'Ticket closed successfully',
      statusCode: 200,
      data: { ticket },
    };
  }
}

export default new TicketService();
