// src/APIs/ticket/ticket.model.ts
import mongoose, { Schema } from 'mongoose';
import { TICKET_STATUSES } from './ticket.constants.ts';
import type { ITicket, ITicketMessage } from './ticket.interface.ts';

/**
 * Ticket Message Schema (The Conversation Thread)
 */
const ticketMessageSchema = new Schema<ITicketMessage>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

/**
 * Main Ticket Schema
 */
const ticketSchema = new Schema<ITicket>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'open',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    messages: {
      type: [
        {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'TicketMessage',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const TicketMessage = mongoose.model<ITicketMessage>(
  'TicketMessage',
  ticketMessageSchema,
);
const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);

export default Ticket;
