export const ORDER_STATUSES = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "canceled",
] as const;

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "canceled"],
  paid: ["shipped", "canceled"],
  shipped: ["delivered"],
  delivered: [],
  canceled: [],
};

export type OrderStatus = (typeof ORDER_STATUSES)[number];
