import { NextResponse } from "next/server";
import { findThread, tokenFrom } from "@/lib/chat/server";
import { clientKey, rateLimit } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * The visitor's own conversation. ?after=<iso time> returns only newer messages.
 * ?open=1 means the chat window is open (marks agent messages as read); without it the call only counts unread messages.
 */
export async function GET(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ available: false });
  if (!rateLimit(`chat-get:${clientKey(req)}`, 90, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const url = new URL(req.url);
  const { thread, userEmail } = await findThread(tokenFrom(req));
  const base = { available: true, signedIn: !!userEmail, email: userEmail };
  if (!thread) return NextResponse.json({ ...base, thread: null, messages: [], unread: 0 });

  const db = supabaseAdmin();
  const open = url.searchParams.get("open") === "1";
  const after = url.searchParams.get("after");
  let q = db.from("chat_messages").select("*").eq("thread_id", thread.id).order("created_at", { ascending: true }).limit(500);
  if (after && !Number.isNaN(Date.parse(after))) q = q.gt("created_at", after);
  const { data } = open ? await q : { data: [] as { id: string; sender: string; body: string; created_at: string; is_auto?: boolean }[] };

  let unread = thread.unread_visitor;
  if (open) {
    await db.from("chat_threads").update({ unread_visitor: 0, last_visitor_seen_at: new Date().toISOString() }).eq("id", thread.id);
    unread = 0;
  }
  return NextResponse.json({ ...base, thread: { status: thread.status }, messages: data ?? [], unread });
}
