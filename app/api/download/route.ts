import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState, type LicenseRow } from "@/lib/licensing/service";
import { clientKey, rateLimit } from "@/lib/security";

/** login -> license validation -> 60-second signed URL to a PRIVATE bucket -> download. */
export async function GET(req: Request) {
  const user = await getUser();
  if (!user?.email) return NextResponse.redirect(new URL("/login?next=/dashboard/downloads", req.url));
  if (!rateLimit(`dl:${user.id}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const db = supabaseAdmin();
  const { data: lics } = await db.from("licenses").select("*").ilike("customer_email", user.email);
  const usable = ((lics ?? []) as LicenseRow[]).find((l) => licenseState(l) === "active");
  if (!usable) return NextResponse.json({ error: "No active license." }, { status: 403 });

  const { data: product } = await db.from("products").select("*").eq("is_current", true).maybeSingle();
  if (!product) return NextResponse.json({ error: "No download is published yet." }, { status: 404 });

  const { data: signed, error } = await db.storage.from("ea-files").createSignedUrl(product.storage_path, 60, { download: true });
  if (error || !signed) return NextResponse.json({ error: "File unavailable." }, { status: 500 });

  await db.from("downloads").insert({ license_id: usable.id, user_email: user.email, product_id: product.id, ip: clientKey(req) });
  return NextResponse.redirect(signed.signedUrl);
}
