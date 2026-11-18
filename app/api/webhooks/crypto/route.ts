import { NextResponse } from "next/server";
import { lookupPayment, verifyWebhook } from "@/lib/payments/cryptopayr";
import { settleOrder } from "@/lib/payments/settle";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * CryptoPayr webhook. Delivery is a SINGLE attempt (no automatic retries), so we always answer 200 for events
 * we have stored or deliberately ignored, and 500 only if processing failed (re-send it from the CryptoPayr dashboard,
 * or use "Check with CryptoPayr" in /admin).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const event = verifyWebhook(raw, req.headers.get("x-cryptopayr-signature"));
  if (!event) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const db = supabaseAdmin();
  const byTid = await db.from("orders").select("*").eq("provider_ref", event.tid).maybeSingle();
  let order = byTid.data;
  if (!order && typeof event.metadata === "string" && event.metadata) {
    order = (await db.from("orders").select("*").eq("order_id", event.metadata).maybeSingle()).data;
    if (order?.provider_ref && order.provider_ref !== event.tid) order = null; // payment id must match the order
  }
  if (!order) return NextResponse.json({ received: true, ignored: "unknown order" });

  try {
    switch (event.status) {
      case "COMPLETED": {
        // Independent double-check with CryptoPayr. If it is unreachable we rely on the verified signature.
        const live = await lookupPayment(event.tid);
        if (live && live.status !== "COMPLETED") return NextResponse.json({ received: true, ignored: "not completed on lookup" });
        await settleOrder(order, live ?? event);
        break;
      }
      case "REFUNDED":
        await db.from("orders").update({ order_status: "refunded" }).eq("order_id", order.order_id);
        if (order.license_id) await db.from("licenses").update({ status: "suspended" }).eq("id", order.license_id); // owner can review in /admin
        break;
      case "EXPIRED":
        await db.from("orders").update({ order_status: "expired", payment_status: "payment_expired" }).eq("order_id", order.order_id).neq("order_status", "confirmed");
        break;
      case "CANCELLED":
        await db.from("orders").update({ order_status: "failed" }).eq("order_id", order.order_id).neq("order_status", "confirmed");
        break;
      default:
        break; // PENDING etc.
    }
  } catch (e) {
    console.error("webhook processing failed", e);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
