import { NextResponse } from "next/server";
import { paymentProvider } from "@/lib/payments/provider";

/**
 * Payment confirmation happens ONLY here (signed webhook), never from a client "I have paid" click.
 * On a verified "payment_confirmed": mark order confirmed -> create license -> create account
 * -> enable secure download -> send emails. All idempotent (webhooks can be retried).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-signature");
  const event = await paymentProvider.verifyWebhook(raw, signature);
  if (!event) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

  // TODO: load order by event.orderId, update status, and (if confirmed) create the license.
  return NextResponse.json({ received: true });
}
