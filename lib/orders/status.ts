export type OrderView = "awaiting_payment" | "under_review" | "approved" | "rejected" | "expired" | "refunded";

export const ORDER_VIEW_LABEL: Record<OrderView, string> = {
  awaiting_payment: "Awaiting payment",
  under_review: "Payment under review",
  approved: "Approved",
  rejected: "Rejected",
  expired: "Payment window ended",
  refunded: "Refunded",
};

/** Single place that turns raw order columns into the status a customer sees. */
export function deriveStatus(o: { order_status: string; tx_hash: string | null; expires_at: string | null }, now = new Date()): OrderView {
  if (o.order_status === "confirmed") return "approved";
  if (o.order_status === "refunded") return "refunded";
  if (o.order_status === "failed") return "rejected";
  if (o.tx_hash) return "under_review";
  if (o.expires_at && new Date(o.expires_at) < now) return "expired";
  return "awaiting_payment";
}
