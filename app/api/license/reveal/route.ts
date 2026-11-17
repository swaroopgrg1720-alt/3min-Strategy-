import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptKey } from "@/lib/licensing/keys";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";

/** Lets a signed-in customer view THEIR OWN license key. Ownership is enforced by RLS, then the key is decrypted server-side. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user?.email) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!rateLimit(`reveal:${user.id}:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const body = await req.json().catch(() => ({}));
  const id = sanitizeText(body.licenseId, 60);
  const owned = await (await supabaseServer()).from("licenses").select("id").eq("id", id).maybeSingle(); // RLS: own rows only
  if (!owned.data) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data } = await supabaseAdmin().from("licenses").select("key_ciphertext").eq("id", id).single();
  return NextResponse.json({ key: decryptKey(data!.key_ciphertext) }, { headers: { "Cache-Control": "no-store" } });
}
