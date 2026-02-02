export const PAYMENT_STATUSES = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];