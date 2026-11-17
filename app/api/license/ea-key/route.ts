import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState } from "@/lib/licensing/service";
import { expiryYmd, makeEaKey } from "@/lib/licensing/ea-key";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";

/**
 * Returns the EA key for the customer's OWN license.
 * The first call binds the license to the MT5 account the customer enters (atomic, one account per license).
 * Later calls return the key for the bound account (monthly renewals change the expiry, so the key changes).
 */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!rateLimit(`eakey:${user.id}:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const id = sanitizeText(body.licenseId, 60);
  const account = sanitizeText(body.account, 20);

  // RLS: this only returns the license if it belongs to the signed-in user.
  const { data: lic } = await (await supabaseServer()).from("licenses")
    .select("id,plan,expiration_date,status,mt5_account").eq("id", id).maybeSingle();
  if (!lic) return NextResponse.json({ error: "License not found." }, { status: 404 });

  const state = licenseState(lic);
  if (state !== "active") return NextResponse.json({ error: `This license is ${state}.` }, { status: 403 });

  let bound: string | null = lic.mt5_account;
  if (!bound) {
    if (!/^\d{3,12}$/.test(account)) return NextResponse.json({ error: "Enter your MT5 account number (digits only)." }, { status: 400 });
    const { data: ok } = await supabaseAdmin().from("licenses")
      .update({ mt5_account: account, activation_status: "activated", activated_at: new Date().toISOString() })
      .eq("id", lic.id).is("mt5_account", null).select("id").maybeSingle();
    if (!ok) return NextResponse.json({ error: "This license was just activated on another account." }, { status: 409 });
    bound = account;
  }

  try {
    const key = makeEaKey(bound, expiryYmd(lic.plan, lic.expiration_date));
    return NextResponse.json({ key, account: bound }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Key generation is not configured yet. Contact support." }, { status: 503 });
  }
}
