import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/chat/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Admin: number of conversations with unread visitor messages (for the menu badge). */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ count: 0 });
  const { count } = await supabaseAdmin().from("chat_threads").select("id", { count: "exact", head: true }).gt("unread_admin", 0);
  return NextResponse.json({ count: count ?? 0 });
}
