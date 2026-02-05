export const PAYMENT_STATUSES = [
  'pending',
  'initialized',
  'verified',
  'cancelled',
  'failed',
  'refunded',
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
