import { NextResponse } from "next/server";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";

/** Checkout polls this. Status must come from the database, which is updated by the webhook only. */
export async function GET(req: Request) {
  if (!rateLimit(`status:${clientKey(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const orderId = sanitizeText(new URL(req.url).searchParams.get("orderId"), 40);
  if (!orderId) return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  // TODO: look up order in DATABASE_URL.
  return NextResponse.json({ orderId, status: "awaiting_payment" });
}
