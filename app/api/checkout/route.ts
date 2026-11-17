import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cryptoOptions } from "@/lib/config/payments";
import { isPlanId, plans } from "@/lib/config/pricing";
import { paymentProvider } from "@/lib/payments/provider";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";

/**
 * Creates a payment request. The AMOUNT is always derived server-side from the plan;
 * the client never decides the price. Persist the order in your database here.
 */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientKey(req)}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = sanitizeText(body.email, 254);
  const coin = sanitizeText(body.coin, 10);
  const network = sanitizeText(body.network, 60);
  if (!isPlanId(body.plan) || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid plan or email." }, { status: 400 });
  }
  const option = cryptoOptions.find((o) => o.coin === coin && o.enabled);
  if (!option || !option.networks.includes(network)) {
    return NextResponse.json({ error: "Unsupported coin or network." }, { status: 400 });
  }

  const orderId = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`;
  const instructions = await paymentProvider.createPayment({
    orderId,
    plan: body.plan,
    coin: option.coin,
    network,
    amountUsd: plans[body.plan].priceUsd,
    customerEmail: email,
  });
  // TODO: save order { status: "pending" } to DATABASE_URL, then return instructions.
  return NextResponse.json({ orderId, instructions });
}
