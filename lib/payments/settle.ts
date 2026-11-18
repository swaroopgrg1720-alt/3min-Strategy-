import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fulfilOrder } from "@/lib/licensing/service";
import { matchOrder, type PaymentSnapshot } from "./cryptopayr";

export interface OrderRow { order_id: string; amount_usd: number | string; order_status: string; license_id: string | null }
export type SettleResult = "fulfilled" | "underpaid" | "mismatch" | "not_completed";

/**
 * Turns a verified payment into a license. Only a COMPLETED payment that matches the order exactly is fulfilled.
 * Anything unusual goes to "payment_detected" so the owner reviews it in /admin.
 */
export async function settleOrder(order: OrderRow, p: PaymentSnapshot): Promise<SettleResult> {
  if (p.status !== "COMPLETED") return "not_completed";
  const verdict = matchOrder(p, order);
  if (verdict !== "ok") {
    await supabaseAdmin().from("orders")
      .update({ order_status: "payment_detected", payment_status: "payment_detected" })
      .eq("order_id", order.order_id).neq("order_status", "confirmed");
    return verdict;
  }
  await fulfilOrder(order.order_id); // idempotent: safe if the webhook is delivered twice
  return "fulfilled";
}
