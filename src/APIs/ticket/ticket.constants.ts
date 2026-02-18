export const TICKET_STATUSES = ['open', 'inProgress', 'closed'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_STATUS_FLOW: Record<TicketStatus, TicketStatus[]> = {
  open: ['inProgress', 'closed'],
  inProgress: ['closed'],
  closed: [],
};
