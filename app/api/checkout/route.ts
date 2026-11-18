import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isPlanId, plans } from "@/lib/config/pricing";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { toOrderView } from "@/lib/orders/view";

const WINDOW_MINUTES = 60;

/** Creates an order for a payment method the owner enabled. The AMOUNT is always derived server-side from the plan. */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Checkout is not available yet." }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const methodId = sanitizeText(body.methodId, 40);
  if (!isPlanId(body.plan) || !isValidEmail(email) || !/^[0-9a-f-]{36}$/i.test(methodId)) {
    return NextResponse.json({ error: "Please choose a plan, a payment method and enter a valid email." }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: method } = await db.from("payment_methods").select("*").eq("id", methodId).eq("enabled", true).maybeSingle();
  if (!method) return NextResponse.json({ error: "That payment method is not available." }, { status: 400 });

  const orderId = `ORD-${randomBytes(6).toString("hex").toUpperCase()}`; // unguessable
  const { data: order, error } = await db.from("orders").insert({
    order_id: orderId, customer_email: email, plan: body.plan, amount_usd: plans[body.plan].priceUsd,
    coin: method.coin, network: method.network, payment_method_id: method.id, wallet_address: method.address,
    is_stablecoin: method.is_stablecoin, pay_note: method.instructions,
    expires_at: new Date(Date.now() + WINDOW_MINUTES * 60_000).toISOString(),
  }).select("*").single();
  if (error || !order) return NextResponse.json({ error: "Could not create order." }, { status: 500 });
  return NextResponse.json({ order: toOrderView(order) });
}
