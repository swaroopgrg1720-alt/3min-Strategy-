import { NextResponse } from "next/server";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";
import { toOrderView } from "@/lib/orders/view";

/** Checkout polls this. Order IDs are random and unguessable; status only changes when the owner reviews the payment. */
export async function GET(req: Request) {
  if (!rateLimit(`status:${clientKey(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const orderId = sanitizeText(new URL(req.url).searchParams.get("orderId"), 40);
  if (!orderId || !isSupabaseConfigured()) return NextResponse.json({ error: "Missing orderId." }, { status: 400 });
  const { data } = await supabaseAdmin().from("orders").select("*").eq("order_id", orderId).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ order: toOrderView(data) }, { headers: { "Cache-Control": "no-store" } });
}
