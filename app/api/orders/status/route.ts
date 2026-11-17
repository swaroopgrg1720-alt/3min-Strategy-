import { NextResponse } from "next/server";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** Checkout polls this. Status comes from the database, which only the verified webhook / admin can change. */
export async function GET(req: Request) {
  if (!rateLimit(`status:${clientKey(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const orderId = sanitizeText(new URL(req.url).searchParams.get("orderId"), 40);
  if (!orderId || !isSupabaseConfigured()) return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  const { data } = await supabaseAdmin().from("orders").select("payment_status, expires_at").eq("order_id", orderId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const expired = data.payment_status === "awaiting_payment" && data.expires_at && new Date(data.expires_at) < new Date();
  return NextResponse.json({ orderId, status: expired ? "payment_expired" : data.payment_status });
}
