import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isPlanId, plans } from "@/lib/config/pricing";
import { site } from "@/lib/config/site";
import { createPayment } from "@/lib/payments/cryptopayr";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** Creates an order and a CryptoPayr payment. The AMOUNT is always derived server-side from the plan. */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured() || !process.env.CRYPTO_PAYMENT_API_KEY) return NextResponse.json({ error: "Checkout is not available yet." }, { status: 503 });
  if (/localhost|127\.0\.0\.1/.test(site.url)) return NextResponse.json({ error: "Site URL is not configured (set NEXT_PUBLIC_SITE_URL to your real https domain)." }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const email = sanitizeText(body.email, 254).toLowerCase();
  if (!isPlanId(body.plan) || !isValidEmail(email)) return NextResponse.json({ error: "Invalid plan or email." }, { status: 400 });

  const orderId = `ORD-${randomBytes(6).toString("hex").toUpperCase()}`; // unguessable
  const amountUsd = plans[body.plan].priceUsd;
  const db = supabaseAdmin();
  const ins = await db.from("orders").insert({ order_id: orderId, customer_email: email, plan: body.plan, amount_usd: amountUsd, coin: "CRYPTO", network: "CryptoPayr" });
  if (ins.error) return NextResponse.json({ error: "Could not create order." }, { status: 500 });

  try {
    const pay = await createPayment({
      orderId, amountUsd,
      successUrl: `${site.url}/checkout/success?order=${orderId}`,
      cancelUrl: `${site.url}/checkout/cancelled?plan=${body.plan}`,
      webhookUrl: `${site.url}/api/webhooks/crypto`,
    });
    await db.from("orders").update({ provider_ref: pay.tid }).eq("order_id", orderId);
    return NextResponse.json({ orderId, checkoutUrl: pay.checkoutUrl });
  } catch (e) {
    console.error("createPayment failed", e);
    await db.from("orders").update({ order_status: "failed" }).eq("order_id", orderId);
    return NextResponse.json({ error: "Could not start the payment. Please try again shortly." }, { status: 502 });
  }
}
