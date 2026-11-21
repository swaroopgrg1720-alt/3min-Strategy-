"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/config/site";

interface Msg { id: string; sender: "visitor" | "agent"; body: string; created_at: string; pending?: boolean }

const KEY = "3ms_chat_token";
const HIDDEN_ON = ["/admin"];
const store = {
  get: () => { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } },
  set: (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } },
};

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const dayOf = (iso: string) => {
  const d = new Date(iso), n = new Date();
  if (d.toDateString() === n.toDateString()) return "Today";
  const y = new Date(n.getTime() - 86_400_000);
  return d.toDateString() === y.toDateString() ? "Yesterday" : d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

const Svg = ({ d, size = 22 }: { d: string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d.map((p) => <path key={p} d={p} />)}</svg>
);
const I = {
  chat: ["M4 5h16v11H9l-5 4z"],
  close: ["M6 6l12 12M18 6 6 18"],
  down: ["M6 9l6 6 6-6"],
  send: ["M5 12l14-7-5 14-2.5-5.5z", "M11.5 13.5 19 5"],
  home: ["M4 11l8-7 8 7", "M6 10v10h12V10"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
};

export function ChatWidget() {
  const path = usePathname() ?? "/";
  const hidden = HIDDEN_ON.some((p) => path === p || path.startsWith(`${p}/`));

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"home" | "messages">("home");
  const [available, setAvailable] = useState(true);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [unread, setUnread] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [hasThread, setHasThread] = useState(false);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const tokenRef = useRef("");
  const lastRef = useRef<string>("");
  const endRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const headers = useCallback((): HeadersInit => (tokenRef.current ? { "x-chat-token": tokenRef.current } : {}), []);

  useEffect(() => { tokenRef.current = store.get(); }, []);

  const merge = useCallback((incoming: Msg[]) => {
    if (!incoming.length) return;
    setMsgs((cur) => {
      const have = new Set(cur.map((m) => m.id));
      const add = incoming.filter((m) => !have.has(m.id));
      // A server copy of a message replaces its optimistic placeholder.
      const base = cur.filter((m) => !(m.pending && incoming.some((n) => n.sender === "visitor" && n.body === m.body)));
      if (!add.length && base.length === cur.length) return cur;
      return [...base, ...add].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
    lastRef.current = incoming[incoming.length - 1].created_at > lastRef.current ? incoming[incoming.length - 1].created_at : lastRef.current;
  }, []);

  const poll = useCallback(async (isOpen: boolean) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const qs = isOpen ? `?open=1${lastRef.current ? `&after=${encodeURIComponent(lastRef.current)}` : ""}` : "";
      const res = await fetch(`/api/chat/thread${qs}`, { headers: headers(), cache: "no-store" });
      if (!res.ok) return;
      const j = await res.json();
      if (j.available === false) { setAvailable(false); return; }
      setSignedIn(!!j.signedIn);
      if (j.email && !email) setEmail(j.email);
      setHasThread(!!j.thread);
      setUnread(j.unread ?? 0);
      if (isOpen) merge(j.messages ?? []);
    } catch { /* offline: try again next tick */ } finally { busy.current = false; }
  }, [headers, merge, email]);

  // Unread check while closed, live updates while open. Paused when the tab is in the background.
  useEffect(() => {
    if (hidden) return;
    const every = open ? 4_000 : 30_000;
    poll(open);
    const id = window.setInterval(() => { if (!document.hidden) poll(open); }, every);
    return () => window.clearInterval(id);
  }, [open, hidden, poll]);

  useEffect(() => { if (open && tab === "messages") endRef.current?.scrollIntoView({ block: "end" }); }, [msgs, open, tab]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true); setError("");
    const temp: Msg = { id: `tmp-${Date.now()}`, sender: "visitor", body, created_at: new Date().toISOString(), pending: true };
    setMsgs((c) => [...c, temp]); setText("");
    try {
      const res = await fetch("/api/chat/message", {
        method: "POST", headers: { "Content-Type": "application/json", ...headers() },
        body: JSON.stringify({ body, name: name.trim(), email: email.trim() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Message not sent.");
      if (j.token) { tokenRef.current = j.token; store.set(j.token); }
      setHasThread(true);
      setMsgs((c) => c.filter((m) => m.id !== temp.id));
      merge([j.message]);
    } catch (err) {
      setMsgs((c) => c.filter((m) => m.id !== temp.id));
      setText(body);
      setError(err instanceof Error ? err.message : "Message not sent.");
    } finally { setSending(false); }
  }

  if (hidden || !available) return null;

  const startMessage = () => { setTab("messages"); };
  const lastAgent = [...msgs].reverse().find((m) => m.sender === "agent");
  const needsContact = !hasThread && !signedIn;
  const field = "min-h-[44px] w-full rounded-xl border border-line bg-bg px-3 text-[15px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";

  return (
    <>
      {open && (
        <div role="dialog" aria-label="Chat with customer agent"
          className="fixed inset-0 z-[55] flex flex-col overflow-hidden border-line bg-bg2 sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-7rem)] sm:w-[380px] sm:rounded-3xl sm:border sm:shadow-2xl">
          <header className="relative shrink-0 bg-forest px-5 pb-5 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-bg" aria-hidden="true"><Svg d={I.chat} size={22} />
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-forest bg-accent" /></span>
                <div>
                  <p className="font-display text-[18px] font-semibold leading-tight text-ink">Customer agent</p>
                  <p className="text-[13px] text-ink/70">{site.name} support</p>
                </div>
              </div>
              <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-black/20"><Svg d={I.down} size={22} /></button>
            </div>
          </header>

          {tab === "home" ? (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-bg p-4">
              <div className="rounded-2xl border border-line bg-bg2 p-5">
                <p className="font-display text-[22px] font-semibold leading-snug text-ink">Hi there 👋<br />How can we help?</p>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">Ask about the EA, licenses, payments or setup. A real person from our team replies here.</p>
              </div>
              <button type="button" onClick={startMessage}
                className="flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border border-line bg-bg2 px-5 text-left active:bg-forest/40">
                <span><span className="block text-[16px] font-semibold text-ink">Send us a message</span>
                  <span className="block text-[13px] text-muted">We typically reply within a few hours</span></span>
                <span className="text-accent"><Svg d={I.arrow} size={20} /></span>
              </button>
              {hasThread && (
                <button type="button" onClick={() => setTab("messages")} className="w-full rounded-2xl border border-line bg-bg2 p-4 text-left active:bg-forest/40">
                  <p className="text-[13px] font-semibold text-muted">Your conversation</p>
                  <p className="mt-1 line-clamp-2 text-[15px] text-ink">{lastAgent ? lastAgent.body : msgs[msgs.length - 1]?.body ?? "Open your chat history"}</p>
                </button>
              )}
              <p className="px-1 pt-1 text-center text-[12px] text-muted">Never share your password or wallet seed phrase in chat.</p>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto bg-bg px-4 py-4" aria-live="polite">
                {msgs.length === 0 && (
                  <div className="mt-6 text-center text-[14px] text-muted">
                    <p className="font-display text-lg font-semibold text-ink">Start the conversation</p>
                    <p className="mt-1">Write your question below. Your chat history stays here on this device{signedIn ? " and in your account" : ""}.</p>
                  </div>
                )}
                {msgs.map((m, i) => {
                  const mine = m.sender === "visitor";
                  const newDay = i === 0 || dayOf(msgs[i - 1].created_at) !== dayOf(m.created_at);
                  const first = i === 0 || msgs[i - 1].sender !== m.sender || newDay;
                  return (
                    <div key={m.id}>
                      {newDay && <p className="my-3 text-center text-[12px] text-muted">{dayOf(m.created_at)}</p>}
                      <div className={`flex ${mine ? "justify-end" : "justify-start"} ${first ? "mt-3" : "mt-1"}`}>
                        <div className={`max-w-[82%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                          {!mine && first && <span className="mb-1 ml-1 text-[12px] font-semibold text-muted">Customer agent</span>}
                          <div className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${mine ? "rounded-br-md bg-accent text-bg" : "rounded-bl-md border border-line bg-bg2 text-ink"} ${m.pending ? "opacity-60" : ""}`}>{m.body}</div>
                          <span className="mt-1 px-1 text-[11px] text-muted">{m.pending ? "Sending…" : timeOf(m.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form onSubmit={send} className="shrink-0 border-t border-line bg-bg2 p-3">
                {needsContact && (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input className={field} placeholder="Name (optional)" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <input className={field} placeholder="Email for replies" type="email" inputMode="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                )}
                {error && <p role="alert" className="mb-2 text-[13px] text-red-300">{error}</p>}
                <div className="flex items-end gap-2">
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={1000} placeholder="Write a message…" aria-label="Message"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(hover: hover)").matches) { e.preventDefault(); void send(); } }}
                    className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none" />
                  <button type="submit" aria-label="Send message" disabled={!text.trim() || sending}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-bg disabled:opacity-40 active:brightness-90"><Svg d={I.send} size={20} /></button>
                </div>
                {needsContact && <p className="mt-2 text-[12px] text-muted">Add an email to get an email when we reply while you are away.</p>}
              </form>
            </>
          )}

          <nav aria-label="Chat sections" className="grid shrink-0 grid-cols-2 border-t border-line bg-bg2">
            {([["home", "Home", I.home], ["messages", "Messages", I.chat]] as const).map(([id, label, d]) => (
              <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold ${tab === id ? "text-accent" : "text-muted"}`}>
                <Svg d={d} size={20} />{label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <button type="button" aria-label={open ? "Close chat" : "Open chat"} aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-4 right-4 z-50 h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-lg shadow-black/40 active:brightness-90 sm:bottom-5 sm:right-5 ${open ? "hidden sm:flex" : "flex"}`}>
        <Svg d={open ? I.close : I.chat} size={26} />
        {!open && unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-red-500 px-1 text-[11px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
    </>
  );
}
