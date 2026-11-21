import { NextResponse } from "next/server";
import { MAX_BODY, findThread, newToken, hashToken, notifyAdmin, preview, tokenFrom, type ThreadRow } from "@/lib/chat/server";
import { ACK, faqAnswer } from "@/lib/chat/autoreply";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** A visitor sends a message. The first message creates the conversation and returns the visitor's private token. */
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Chat is not available right now." }, { status: 503 });
  if (!rateLimit(`chat-post:${clientKey(req)}`, 12, 60_000)) return NextResponse.json({ error: "You are sending messages too fast. Please wait a moment." }, { status: 429 });

  let json: Record<string, unknown>;
  try { json = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const body = sanitizeText(json.body, MAX_BODY);
  if (!body) return NextResponse.json({ error: "Write a message first." }, { status: 400 });

  const db = supabaseAdmin();
  const found = await findThread(tokenFrom(req));
  let thread = found.thread;
  let token = "";

  if (!thread) {
    const email = sanitizeText(json.email, 254).toLowerCase();
    if (email && !isValidEmail(email)) return NextResponse.json({ error: "That email address does not look right." }, { status: 400 });
    token = newToken();
    const ins = await db.from("chat_threads").insert({
      token_hash: hashToken(token), user_id: found.userId, name: sanitizeText(json.name, 60) || null, email: found.userEmail?.toLowerCase() || email || null,
    }).select("*").single();
    if (ins.error || !ins.data) return NextResponse.json({ error: "Could not start the chat. Please try again." }, { status: 500 });
    thread = ins.data as ThreadRow;
  } else {
    // Slow abuse guard: at most 40 visitor messages per conversation per hour.
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await db.from("chat_messages").select("id", { count: "exact", head: true }).eq("thread_id", thread.id).eq("sender", "visitor").gt("created_at", since);
    if ((count ?? 0) >= 40) return NextResponse.json({ error: "Message limit reached for now. Please try again later." }, { status: 429 });
  }

  const msg = await db.from("chat_messages").insert({ thread_id: thread.id, sender: "visitor", body }).select("id,sender,body,created_at").single();
  if (msg.error || !msg.data) return NextResponse.json({ error: "Message not sent. Please try again." }, { status: 500 });

  await db.from("chat_threads").update({
    status: "open", last_message_at: msg.data.created_at, last_message_preview: preview(body), unread_admin: (thread.unread_admin ?? 0) + 1, last_visitor_seen_at: new Date().toISOString(),
  }).eq("id", thread.id);

  // Automatic reply: only when no human has answered in the last 3 hours.
  const auto: unknown[] = [];
  try {
    const since = new Date(Date.now() - 3 * 3_600_000).toISOString();
    const { data: agents } = await db.from("chat_messages").select("*").eq("thread_id", thread.id).eq("sender", "agent").gt("created_at", since).order("created_at", { ascending: false }).limit(20);
    const list = (agents ?? []) as { body: string; is_auto?: boolean }[];
    const humanActive = list.some((m) => m.is_auto === false);
    if (!humanActive) {
      const answer = faqAnswer(body);
      const reply = answer ? (list.some((m) => m.body === answer) ? null : answer) : list.length === 0 ? ACK : null;
      if (reply) {
        let r = await db.from("chat_messages").insert({ thread_id: thread.id, sender: "agent", body: reply, is_auto: true }).select("*").single();
        if (r.error) r = await db.from("chat_messages").insert({ thread_id: thread.id, sender: "agent", body: reply }).select("*").single();
        if (r.data) auto.push(r.data);
      }
    }
  } catch (e) { console.error("autoreply", e); }

  await notifyAdmin(thread, body).catch((e) => console.error("notifyAdmin", e));
  return NextResponse.json({ message: msg.data, auto, ...(token ? { token } : {}) });
}
