export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "canceled",
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];
