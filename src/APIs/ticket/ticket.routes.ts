import express from 'express';

import ticketController from './ticket.controller.ts';
import authenticateToken from '../../middlewares/authenticateToken.ts';
import authorizeRole from '../../middlewares/authorizeRole.ts';
import validate from '../../middlewares/zod.validation.ts';

import {
  getTicketByIdSchema,
  getUserTicketsSchema,
  createTicketSchema,
  addMessageSchema,
  closeTicketSchema,
} from './ticket.schema.ts';

const ticketRouter = express.Router();

ticketRouter.use(authenticateToken); // All routes require authentication

ticketRouter.get(
  '/:id',
  validate(getTicketByIdSchema),
  ticketController.getById,
);
ticketRouter.get(
  '/user/:userId',
  validate(getUserTicketsSchema),
  ticketController.getByUserId,
);
ticketRouter.post('/', validate(createTicketSchema), ticketController.create);
ticketRouter.post(
  '/message',
  validate(addMessageSchema),
  ticketController.addMessage,
);
ticketRouter.post(
  '/close/:id',
  validate(closeTicketSchema),
  authorizeRole(['admin']),
  ticketController.closeTicket,
);

export default ticketRouter;
