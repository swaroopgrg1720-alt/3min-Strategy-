
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState } from "@/lib/licensing/service";
import { decryptKey, keyShapeOk } from "@/lib/licensing/keys";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user?.email)
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  if (!rateLimit(`eakey:${user.id}:${clientKey(req)}`, 10, 60000))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const id = sanitizeText(body.licenseId, 60);
  const account = sanitizeText(body.account, 20);

  const { data: lic, error } = await (await supabaseServer())
    .from("licenses")
    .select("id,plan,expiration_date,status,mt5_account,key_ciphertext")
    .eq("id", id)
    .maybeSingle();

  if (error || !lic)
    return NextResponse.json({ error: "License not found." }, { status: 404 });

  const state = licenseState(lic);
  if (state !== "active")
    return NextResponse.json({ error: `This license is ${state}.` }, { status: 403 });

  let bound: string | null = lic.mt5_account;

  if (!bound) {
    if (!/^\d{3,12}$/.test(account))
      return NextResponse.json({ error: "Enter your MT5 account number." }, { status: 400 });

    const { data: ok, error: bindError } = await supabaseAdmin()
      .from("licenses")
      .update({
        mt5_account: account,
        activation_status: "activated",
        activated_at: new Date().toISOString(),
      })
      .eq("id", lic.id)
      .is("mt5_account", null)
      .select("id")
      .maybeSingle();

    if (bindError || !ok)
      return NextResponse.json({ error: "License already activated on another account." }, { status: 409 });

    bound = account;
  }

  try {
    if (!lic.key_ciphertext) throw new Error("Missing encrypted key");

    const key = decryptKey(lic.key_ciphertext);
    if (!keyShapeOk(key)) throw new Error("Invalid stored key format");

    return NextResponse.json(
      { key, account: bound },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("License reveal failed:", error);
    return NextResponse.json(
      { error: "Could not reveal license. Contact support." },
      { status: 503 }
    );
  }
}
