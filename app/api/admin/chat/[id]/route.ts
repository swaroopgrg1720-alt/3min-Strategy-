import { NextResponse } from "next/server";
import { MAX_BODY, isAdminRequest, notifyVisitor, preview, type ThreadRow } from "@/lib/chat/server";
import { sanitizeText } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };
const okId = (id: string) => /^[0-9a-f-]{36}$/i.test(id);

/** Admin: one conversation with all its messages. Opening it marks it as read. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!okId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const db = supabaseAdmin();
  const [t, m] = await Promise.all([
    db.from("chat_threads").select("id,name,email,user_id,status,created_at").eq("id", id).maybeSingle(),
    db.from("chat_messages").select("*").eq("thread_id", id).order("created_at", { ascending: true }).limit(1000),
  ]);
  if (!t.data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.from("chat_threads").update({ unread_admin: 0 }).eq("id", id);
  return NextResponse.json({ thread: t.data, messages: m.data ?? [] });
}

/** Admin: send a reply. */
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!okId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const json = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const body = sanitizeText(json.body, MAX_BODY);
  if (!body) return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  const db = supabaseAdmin();
  const { data: thread } = await db.from("chat_threads").select("*").eq("id", id).maybeSingle();
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const msg = await db.from("chat_messages").insert({ thread_id: id, sender: "agent", body }).select("id,sender,body,created_at").single();
  if (msg.error || !msg.data) return NextResponse.json({ error: msg.error?.message ?? "Could not send." }, { status: 500 });
  await db.from("chat_threads").update({ last_message_at: msg.data.created_at, last_message_preview: preview(`You: ${body}`), unread_visitor: ((thread as ThreadRow).unread_visitor ?? 0) + 1, unread_admin: 0 }).eq("id", id);
  await notifyVisitor(thread as ThreadRow, body).catch((e) => console.error("notifyVisitor", e));
  return NextResponse.json({ message: msg.data });
}

/** Admin: close or reopen. */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!okId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const json = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (json.status !== "open" && json.status !== "closed") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const { error } = await supabaseAdmin().from("chat_threads").update({ status: json.status }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}

/** Admin: delete a conversation and all its messages. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!okId(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { error } = await supabaseAdmin().from("chat_threads").delete().eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json({ ok: true });
}
