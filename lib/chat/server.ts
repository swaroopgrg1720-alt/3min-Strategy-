import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getUser, isAdminEmail } from "@/lib/auth";
import { escapeHtml, sendEmail } from "@/lib/email/send";
import { site } from "@/lib/config/site";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const MAX_BODY = 1000;
const NOTIFY_GAP_MS = 10 * 60_000;

export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export const tokenFrom = (req: Request) => {
  const t = req.headers.get("x-chat-token")?.trim() ?? "";
  return /^[A-Za-z0-9_-]{20,80}$/.test(t) ? t : "";
};

export interface ThreadRow {
  id: string; token_hash: string | null; user_id: string | null; name: string | null; email: string | null; status: "open" | "closed";
  last_message_at: string; last_message_preview: string | null; unread_admin: number; unread_visitor: number;
  last_visitor_seen_at: string | null; last_admin_notified_at: string | null; last_visitor_notified_at: string | null; created_at: string;
}

/** Finds the visitor's thread: by account when signed in, otherwise by the private token kept in their browser. */
export async function findThread(token: string): Promise<{ thread: ThreadRow | null; userId: string | null; userEmail: string | null }> {
  const db = supabaseAdmin();
  const user = await getUser().catch(() => null);
  if (user) {
    const byUser = await db.from("chat_threads").select("*").eq("user_id", user.id).maybeSingle();
    if (byUser.data) return { thread: byUser.data as ThreadRow, userId: user.id, userEmail: user.email ?? null };
  }
  if (token) {
    const byToken = await db.from("chat_threads").select("*").eq("token_hash", hashToken(token)).maybeSingle();
    if (byToken.data) return { thread: byToken.data as ThreadRow, userId: user?.id ?? null, userEmail: user?.email ?? null };
  }
  return { thread: null, userId: user?.id ?? null, userEmail: user?.email ?? null };
}

/** True when the request comes from a signed-in admin. Use in /api/admin/* routes. */
export async function isAdminRequest(): Promise<boolean> {
  const user = await getUser().catch(() => null);
  return !!user?.email && isAdminEmail(user.email);
}

export const preview = (s: string) => s.replace(/\s+/g, " ").slice(0, 120);
const label = (t: Pick<ThreadRow, "name" | "email">) => t.name || t.email || "A visitor";

/** Emails the admin(s) about a new visitor message, at most once per 10 minutes per conversation. */
export async function notifyAdmin(t: ThreadRow, body: string) {
  if (t.last_admin_notified_at && Date.now() - Date.parse(t.last_admin_notified_at) < NOTIFY_GAP_MS) return;
  const to = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!to.length) return;
  const link = `${site.url}/admin/chat?thread=${t.id}`;
  const ok = await sendEmail({
    to, subject: `New chat message from ${label(t)}`,
    text: `${label(t)}${t.email && t.name ? ` <${t.email}>` : ""} wrote:\n\n${body}\n\nReply here: ${link}`,
    html: `<p><strong>${escapeHtml(label(t))}</strong>${t.email ? ` (${escapeHtml(t.email)})` : ""} wrote:</p><blockquote style="border-left:3px solid #00E59B;margin:0;padding:4px 12px">${escapeHtml(body).replace(/\n/g, "<br>")}</blockquote><p><a href="${link}">Reply in the admin chat</a></p>`,
  });
  if (ok) await supabaseAdmin().from("chat_threads").update({ last_admin_notified_at: new Date().toISOString() }).eq("id", t.id);
}

/** Emails the visitor an agent reply if they left an email and are not looking at the chat right now. */
export async function notifyVisitor(t: ThreadRow, body: string) {
  if (!t.email) return;
  if (t.last_visitor_seen_at && Date.now() - Date.parse(t.last_visitor_seen_at) < 90_000) return; // they are watching the chat
  if (t.last_visitor_notified_at && Date.now() - Date.parse(t.last_visitor_notified_at) < NOTIFY_GAP_MS) return;
  const ok = await sendEmail({
    to: t.email, subject: `${site.name} support replied to you`,
    text: `${body}\n\nTo continue the conversation, open the chat on ${site.url}`,
    html: `<p>Our team replied to your message:</p><blockquote style="border-left:3px solid #00E59B;margin:0;padding:4px 12px">${escapeHtml(body).replace(/\n/g, "<br>")}</blockquote><p><a href="${site.url}">Open the chat on ${escapeHtml(site.name)}</a> to continue the conversation.</p>`,
  });
  if (ok) await supabaseAdmin().from("chat_threads").update({ last_visitor_notified_at: new Date().toISOString() }).eq("id", t.id);
}
