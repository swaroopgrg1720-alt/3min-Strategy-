import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/chat/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Admin: the list of conversations, newest first. */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await supabaseAdmin().from("chat_threads")
    .select("id,name,email,user_id,status,last_message_at,last_message_preview,unread_admin,created_at").order("last_message_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ threads: data ?? [] });
}
