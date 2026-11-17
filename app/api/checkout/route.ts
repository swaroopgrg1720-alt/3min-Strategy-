import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cryptoOptions } from "@/lib/config/payments";
import { isPlanId, plans } from "@/lib/config/pricing";
import { paymentProvider } from "@/lib/payments/provider";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** Creates an order + payment request. The AMOUNT is always derived server-side from the plan. */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Checkout is not available yet." }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const coin = sanitizeText(body.coin, 10);
  const network = sanitizeText(body.network, 60);
  if (!isPlanId(body.plan) || !isValidEmail(email)) return NextResponse.json({ error: "Invalid plan or email." }, { status: 400 });
  const option = cryptoOptions.find((o) => o.coin === coin && o.enabled);
  if (!option || !option.networks.includes(network)) return NextResponse.json({ error: "Unsupported coin or network." }, { status: 400 });

  const orderId = `ORD-${randomBytes(6).toString("hex").toUpperCase()}`; // unguessable
  const amountUsd = plans[body.plan].priceUsd;
  const instructions = await paymentProvider.createPayment({ orderId, plan: body.plan, coin: option.coin, network, amountUsd, customerEmail: email });

  const { error } = await supabaseAdmin().from("orders").insert({
    order_id: orderId, customer_email: email, plan: body.plan, amount_usd: amountUsd,
    coin: option.coin, network, expires_at: instructions.expiresAt,
  });
  if (error) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  return NextResponse.json({ orderId, instructions });
}
