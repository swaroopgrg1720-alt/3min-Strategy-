import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** Public list of payment methods the owner has enabled. The wallet address is only revealed once an order exists. */
export async function GET(req: Request) {
  if (!rateLimit(`pm:${clientKey(req)}`, 60, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured()) return NextResponse.json({ methods: [] });
  const { data } = await supabaseAdmin().from("payment_methods").select("id, coin, network, is_stablecoin, instructions").eq("enabled", true).order("created_at");
  return NextResponse.json({ methods: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
