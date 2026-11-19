import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Admin-only test download (60-second signed link). Not counted as a customer download. */
export async function GET(req: Request) {
  await requireAdmin();
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const db = supabaseAdmin();
  const { data: p } = await db.from("products").select("storage_path").eq("id", id).maybeSingle();
  if (!p) return NextResponse.redirect(new URL("/admin/downloads?error=Version%20not%20found", req.url));
  const { data, error } = await db.storage.from("ea-files").createSignedUrl(p.storage_path, 60, { download: true });
  if (error || !data) return NextResponse.redirect(new URL(`/admin/downloads?error=${encodeURIComponent("File not found in storage: " + p.storage_path)}`, req.url));
  return NextResponse.redirect(data.signedUrl);
}
