import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/provider";
import { fulfilOrder } from "@/lib/licensing/service";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Payment confirmation happens ONLY here (signed webhook) or via the admin panel, never from a client click.
 * Adapt verifyWebhook() in lib/payments/provider.ts to your provider's signature scheme and status names.
 * IMPORTANT: also compare the paid amount/coin with the order before confirming (provider specific).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const event = await paymentProvider.verifyWebhook(raw, req.headers.get("x-signature"));
  if (!event) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  const db = supabaseAdmin();
  try {
    if (event.status === "payment_confirmed" || event.status === "order_complete") {
      await fulfilOrder(event.orderId); // idempotent
    } else {
      await db.from("orders").update({ payment_status: event.status, order_status: event.status === "payment_detected" ? "payment_detected" : event.status === "payment_expired" ? "expired" : "pending" })
        .eq("order_id", event.orderId).neq("order_status", "confirmed");
    }
  } catch {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 }); // provider will retry
  }
  // TODO: send "payment_confirmation" / "license_created" emails (lib/email/templates.ts) once EMAIL_API_KEY is set.
  return NextResponse.json({ received: true });
}
