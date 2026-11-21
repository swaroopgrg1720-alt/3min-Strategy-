"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Thread { id: string; name: string | null; email: string | null; user_id: string | null; status: "open" | "closed"; last_message_at: string; last_message_preview: string | null; unread_admin: number; created_at: string }
interface Msg { id: string; sender: "visitor" | "agent"; body: string; created_at: string; is_auto?: boolean }

const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 1000));
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
const who = (t: Pick<Thread, "name" | "email">) => t.name || t.email || "Visitor";
const full = (iso: string) => new Date(iso).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function ChatConsole({ initialId }: { initialId?: string }) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(initialId ?? null);
  const [active, setActive] = useState<Pick<Thread, "id" | "name" | "email" | "status" | "user_id" | "created_at"> | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"open" | "closed">("open");
  const endRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/chat", { cache: "no-store" });
      if (r.ok) { setThreads((await r.json()).threads ?? []); setLoaded(true); }
    } catch { /* retry next tick */ }
  }, []);

  const loadThread = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/admin/chat/${id}`, { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      setActive(j.thread); setMsgs(j.messages ?? []);
    } catch { /* retry next tick */ }
  }, []);

  useEffect(() => {
    void loadList();
    const id = window.setInterval(() => { if (!document.hidden) { void loadList(); } }, 6_000);
    return () => window.clearInterval(id);
  }, [loadList]);

  useEffect(() => {
    if (!activeId) { setActive(null); setMsgs([]); return; }
    void loadThread(activeId);
    const id = window.setInterval(() => { if (!document.hidden) void loadThread(activeId); }, 4_000);
    return () => window.clearInterval(id);
  }, [activeId, loadThread]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [msgs.length, activeId]);

  async function reply(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !activeId || sending) return;
    setSending(true); setError("");
    try {
      const r = await fetch(`/api/admin/chat/${activeId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Could not send.");
      setMsgs((c) => [...c, j.message]); setText(""); void loadList();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not send."); } finally { setSending(false); }
  }

  async function setStatus(status: "open" | "closed") {
    if (!activeId) return;
    await fetch(`/api/admin/chat/${activeId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setActive((a) => (a ? { ...a, status } : a)); void loadList();
  }

  async function remove() {
    if (!activeId || !window.confirm("Delete this conversation and all its messages? This cannot be undone.")) return;
    await fetch(`/api/admin/chat/${activeId}`, { method: "DELETE" });
    setActiveId(null); void loadList();
  }

  const list = threads.filter((t) => t.status === filter);
  const count = (s: string) => threads.filter((t) => t.status === s).length;
  const btn = "min-h-[40px] rounded-full border border-line px-4 text-sm font-medium text-ink active:bg-forest/40";

  return (
    <div className="grid overflow-hidden rounded-3xl border border-line bg-bg2 lg:h-[calc(100vh-14rem)] lg:min-h-[480px] lg:grid-cols-[320px_1fr]">
      <div className={`${activeId ? "hidden lg:flex" : "flex"} min-h-0 flex-col border-line lg:border-r`}>
        <div className="flex gap-2 border-b border-line p-3">
          {(["open", "closed"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={filter === s}
              className={`min-h-[40px] flex-1 rounded-full border text-sm font-semibold ${filter === s ? "border-accent bg-forest/40 text-accent" : "border-line text-muted"}`}>
              {s === "open" ? "Open" : "Closed"} ({count(s)})
            </button>
          ))}
        </div>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {!loaded && <li className="p-6 text-center text-sm text-muted">Loading…</li>}
          {loaded && list.length === 0 && <li className="p-8 text-center text-sm text-muted">No {filter} conversations.</li>}
          {list.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => setActiveId(t.id)} className={`block w-full border-b border-line px-4 py-3 text-left active:bg-forest/40 ${activeId === t.id ? "bg-forest/30" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[15px] ${t.unread_admin ? "font-bold text-ink" : "font-semibold text-ink"}`}>{who(t)}</span>
                  <span className="shrink-0 text-xs text-muted">{ago(t.last_message_at)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] text-muted">{t.last_message_preview}</span>
                  {t.unread_admin > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-bg">{t.unread_admin}</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${activeId ? "flex" : "hidden lg:flex"} h-[calc(100dvh-11rem)] min-h-0 flex-col lg:h-auto`}>
        {!activeId || !active ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted">{activeId ? "Loading…" : "Select a conversation to read and reply."}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 border-b border-line p-3">
              <div className="flex min-w-0 items-center gap-2">
                <button type="button" aria-label="Back to conversations" onClick={() => setActiveId(null)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink active:bg-forest/40 lg:hidden">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                </button>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold">{who(active)}</p>
                  <p className="truncate text-xs text-muted">{active.email ?? "No email left"}{active.user_id ? " · signed-in customer" : " · guest"} · started {full(active.created_at)}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" className={btn} onClick={() => setStatus(active.status === "open" ? "closed" : "open")}>{active.status === "open" ? "Close" : "Reopen"}</button>
                <button type="button" className={`${btn} text-red-300`} onClick={remove}>Delete</button>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-bg p-4">
              {msgs.map((m) => (
                <div key={m.id} className={`flex ${m.sender === "agent" ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[85%]">
                    <div className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${m.sender === "agent" ? "rounded-br-md bg-accent text-bg" : "rounded-bl-md border border-line bg-bg2 text-ink"}`}>{m.body}</div>
                    <p className={`mt-1 px-1 text-[11px] text-muted ${m.sender === "agent" ? "text-right" : ""}`}>{m.sender === "agent" ? (m.is_auto ? "Automatic reply" : "You") : who(active)} · {full(m.created_at)}</p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form onSubmit={reply} className="border-t border-line p-3">
              {error && <p role="alert" className="mb-2 text-sm text-red-300">{error}</p>}
              <div className="flex items-end gap-2">
                <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={1000} placeholder="Write a reply…" aria-label="Reply"
                  className="max-h-40 min-h-[48px] flex-1 resize-none rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none" />
                <button type="submit" disabled={!text.trim() || sending} className="min-h-[48px] rounded-full bg-accent px-5 text-[15px] font-semibold text-bg disabled:opacity-40 active:brightness-90">{sending ? "Sending…" : "Send"}</button>
              </div>
              <p className="mt-2 text-xs text-muted">{active.email ? "The customer also gets an email if they are not watching the chat." : "No email on file, so they will only see this when they reopen the chat."}</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
