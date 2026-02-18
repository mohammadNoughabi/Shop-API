// src/APIs/ticket/ticket.interface.ts
import type { Types } from 'mongoose';
import type { TicketStatus } from './ticket.constants.ts';
import type { Result } from '../../types/serviceResult/index.d.ts';

export interface ITicket {
  _id: Types.ObjectId;
  title: string;
  description: string; // The initial issue description
  status: TicketStatus;
  userId: Types.ObjectId;
  messages: Types.ObjectId[]; // References to the conversation thread (ITicketMessage)
  createdAt: Date;
  updatedAt: Date;
}

export interface ITicketMessage {
  _id: Types.ObjectId;
  ticketId: Types.ObjectId; // Reference to the parent ticket
  senderId: Types.ObjectId; // Reference to the User (customer or staff)
  message: string;
  attachments: string[];
  createdAt: Date;
}

export interface CreateTicketData {
  title: string;
  description: string;
  userId: Types.ObjectId | string;
}

export interface AddMessageData {
  ticketId: string;
  senderId: Types.ObjectId | string;
  message: string;
  attachments: string[];
}

export type GetTicketByIdResult = Result<{ ticket: ITicket }>;
export type GetUserTicketsResult = Result<{ tickets: ITicket[] }>;
export type CreateTicketResult = Result<{ ticket: ITicket }>;
export type AddMessageResult = Result<{ message: ITicketMessage }>;
export type CloseTicketResult = Result<{ ticket: ITicket }>;
