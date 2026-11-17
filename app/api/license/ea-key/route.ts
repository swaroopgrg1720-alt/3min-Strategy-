import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState } from "@/lib/licensing/service";
import { decryptKey, keyShapeOk } from "@/lib/licensing/keys";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  const user = await getUser();

  if (!user?.email) {
    return NextResponse.json(
      { error: "Not signed in." },
      { status: 401 }
    );
  }

  if (!rateLimit(`eakey:${user.id}:${clientKey(req)}`, 10, 60000)) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));

  const id = sanitizeText(body.licenseId, 60);
  const account = sanitizeText(body.account, 20);

  // Use service role here because key_ciphertext is intentionally
  // hidden from normal authenticated users.
  const admin = supabaseAdmin();

  const { data: lic, error } = await admin
    .from("licenses")
    .select(
      "id,plan,expiration_date,status,mt5_account,key_ciphertext,customer_email"
    )
    .eq("id", id)
    .eq("customer_email", user.email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("License lookup failed:", error);

    return NextResponse.json(
      { error: "Could not load your license." },
      { status: 500 }
    );
  }

  if (!lic) {
    return NextResponse.json(
      { error: "License not found." },
      { status: 404 }
    );
  }

  const state = licenseState(lic);

  if (state !== "active") {
    return NextResponse.json(
      { error: `This license is ${state}.` },
      { status: 403 }
    );
  }

  let bound: string | null = lic.mt5_account;

  // First activation
  if (!bound) {
    if (!/^\d{3,12}$/.test(account)) {
      return NextResponse.json(
        { error: "Enter your MT5 account number." },
        { status: 400 }
      );
    }

    const { data: updated, error: bindError } = await admin
      .from("licenses")
      .update({
        mt5_account: account,
        activation_status: "activated",
        activated_at: new Date().toISOString(),
      })
      .eq("id", lic.id)
      .eq("customer_email", user.email.toLowerCase())
      .is("mt5_account", null)
      .select("id,mt5_account")
      .maybeSingle();

    if (bindError) {
      console.error("License activation failed:", bindError);

      return NextResponse.json(
        { error: "Could not activate this license." },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { error: "License already activated on another account." },
        { status: 409 }
      );
    }

    bound = updated.mt5_account;
  }

  try {
    if (!lic.key_ciphertext) {
      throw new Error("Missing encrypted key");
    }

    const key = decryptKey(lic.key_ciphertext);

    if (!keyShapeOk(key)) {
      throw new Error("Invalid stored key format");
    }

    return NextResponse.json(
      {
        key,
        account: bound,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("License reveal failed:", error);

    return NextResponse.json(
      { error: "Could not reveal license. Contact support." },
      { status: 503 }
    );
  }
}
