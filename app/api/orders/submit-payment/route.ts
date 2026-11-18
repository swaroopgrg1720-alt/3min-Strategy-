import { NextResponse } from "next/server";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { toOrderView } from "@/lib/orders/view";

/**
 * The customer reports their transaction ID. This does NOT approve anything:
 * it moves the order into the owner's review queue. Only an admin can approve.
 */
export async function POST(req: Request) {
  if (!rateLimit(`submit:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Not available." }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const orderId = sanitizeText(body.orderId, 40);
  const txHash = sanitizeText(body.txHash, 140);
  const note = sanitizeText(body.note, 500);
  if (!orderId || txHash.length < 8) return NextResponse.json({ error: "Enter the transaction ID (hash) of your payment." }, { status: 400 });

  const { data, error } = await supabaseAdmin().from("orders")
    .update({ tx_hash: txHash, proof_note: note || null, submitted_at: new Date().toISOString(), order_status: "payment_detected", payment_status: "payment_detected", reject_reason: null })
    .eq("order_id", orderId).in("order_status", ["pending", "failed", "payment_detected"])
    .select("*").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "This order can no longer be updated." }, { status: 409 });
  return NextResponse.json({ order: toOrderView(data) });
}
