"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/config/site";

interface Msg { id: string; sender: "visitor" | "agent"; body: string; created_at: string; is_auto?: boolean; pending?: boolean; k?: string }

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

const Svg = ({ d, size = 22, sw = 1.9 }: { d: string[]; size?: number; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d.map((p) => <path key={p} d={p} />)}</svg>
);
const I = {
  chat: ["M4 5h16v11H9l-5 4z"],
  close: ["M6 6l12 12M18 6 6 18"],
  down: ["M6 9l6 6 6-6"],
  back: ["M15 5l-7 7 7 7"],
  send: ["M12 19V5", "M6 11l6-6 6 6"],
  home: ["M4 11l8-7 8 7", "M6 10v10h12V10"],
  arrow: ["M9 6l6 6-6 6"],
};

const Avatar = ({ size = 32 }: { size?: number }) => (
  <span style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg ring-1 ring-accent/40" aria-hidden="true">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo-sm.png" alt="" width={size} height={size} style={{ width: size * 0.82, height: size * 0.82 }} />
  </span>
);

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
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [vh, setVh] = useState<number | null>(null);
  const tokenRef = useRef("");
  const lastRef = useRef("");
  const holdRef = useRef(false);
  const busy = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLTextAreaElement>(null);
  const seen = useRef(0);

  const headers = useCallback((): HeadersInit => (tokenRef.current ? { "x-chat-token": tokenRef.current } : {}), []);
  useEffect(() => { tokenRef.current = store.get(); }, []);

  const merge = useCallback((incoming: Msg[]) => {
    if (!incoming.length) return;
    setMsgs((cur) => {
      const have = new Set(cur.map((m) => m.id));
      const add = incoming.filter((m) => !have.has(m.id));
      const base = cur.filter((m) => !(m.pending && incoming.some((n) => n.sender === "visitor" && n.body === m.body)));
      if (!add.length && base.length === cur.length) return cur;
      return [...base, ...add].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
    const newest = incoming.reduce((a, m) => (m.created_at > a ? m.created_at : a), "");
    if (newest > lastRef.current) lastRef.current = newest;
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
      if (j.email) setEmail((e) => e || j.email);
      setHasThread(!!j.thread);
      setUnread(j.unread ?? 0);
      if (isOpen && !holdRef.current) merge(j.messages ?? []);
    } catch { /* offline: try again next tick */ } finally { busy.current = false; }
  }, [headers, merge]);

  // Unread check while closed (slow), live updates while open. Paused when the tab is in the background.
  useEffect(() => {
    if (hidden) return;
    poll(open);
    const id = window.setInterval(() => { if (!document.hidden) poll(open); }, open ? 5_000 : 30_000);
    return () => window.clearInterval(id);
  }, [open, hidden, poll]);

  // Phones: size the chat to the visible area so the keyboard never covers the message box, and stop the page behind from scrolling.
  useEffect(() => {
    if (!open || window.innerWidth >= 640) { setVh(null); return; }
    const vv = window.visualViewport;
    const fit = () => { setVh(vv ? vv.height : window.innerHeight); window.scrollTo(0, 0); };
    fit();
    vv?.addEventListener("resize", fit);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { vv?.removeEventListener("resize", fit); document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    const el = scroller.current;
    if (!el || !open || tab !== "messages") return;
    const first = seen.current === 0;
    el.scrollTo({ top: el.scrollHeight, behavior: first ? "auto" : "smooth" });
    seen.current = msgs.length;
  }, [msgs, typing, open, tab]);
  useEffect(() => { if (!open) seen.current = 0; }, [open, tab]);

  useEffect(() => {
    const openChat = () => { setOpen(true); setTab("messages"); };
    window.addEventListener("3ms:open-chat", openChat);
    return () => window.removeEventListener("3ms:open-chat", openChat);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const grow = () => { const el = area.current; if (!el) return; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 120)}px`; };
  useEffect(grow, [text, tab]);

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
      // Swap the instant copy for the saved one in place (same key), so nothing flickers.
      setMsgs((c) => (c.some((m) => m.id === j.message.id)
        ? c.filter((m) => m.id !== temp.id)
        : c.map((m) => (m.id === temp.id ? { ...j.message, k: temp.id } : m))));
      if (j.message.created_at > lastRef.current) lastRef.current = j.message.created_at;
      if (Array.isArray(j.auto) && j.auto.length) {
        // Show a short "typing" moment so an instant reply does not feel abrupt.
        holdRef.current = true; setTyping(true);
        window.setTimeout(() => { merge(j.auto); setTyping(false); holdRef.current = false; }, 1100);
      }
    } catch (err) {
      setMsgs((c) => c.filter((m) => m.id !== temp.id));
      setText(body);
      setError(err instanceof Error ? err.message : "Message not sent.");
    } finally { setSending(false); }
  }

  if (hidden || !available) return null;

  const goMessages = () => { setTab("messages"); if (window.matchMedia("(hover: hover)").matches) window.setTimeout(() => area.current?.focus(), 80); };
  const last = msgs[msgs.length - 1];
  const needsContact = !hasThread && !signedIn;
  const field = "min-h-[44px] w-full rounded-xl border border-line bg-bg px-3.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none";
  const panelStyle = vh ? { height: vh } : undefined;

  return (
    <>
      {open && (
        <div role="dialog" aria-label="Chat with customer agent" style={panelStyle}
          className="chat-panel fixed inset-x-0 top-0 z-[55] flex flex-col overflow-hidden bg-bg2 sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[660px] sm:max-h-[calc(100dvh-7rem)] sm:w-[390px] sm:rounded-[22px] sm:border sm:border-line sm:shadow-[0_24px_60px_-12px_rgba(0,0,0,.65)]">

          {tab === "home" ? (
            <div className="chat-scroll min-h-0 flex-1 overflow-y-auto bg-bg">
              <div className="relative bg-gradient-to-b from-forest to-bg px-6 pb-16 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><Avatar size={44} /><span className="text-[15px] font-bold tracking-[0.14em] text-ink">3MIN <span className="text-accent">SCALP</span></span></div>
                  <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink/80 active:bg-black/20"><Svg d={I.close} size={20} /></button>
                </div>
                <h2 className="mt-9 font-display text-[30px] font-semibold leading-[1.15] tracking-tight text-ink">Hi there.<br /><span className="text-ink/70">How can we help?</span></h2>
              </div>
              <div className="relative z-10 -mt-9 space-y-3 px-4 pb-5">
                <button type="button" onClick={goMessages}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-bg2 px-5 py-4 text-left shadow-lg shadow-black/25 active:bg-forest/40">
                  <span>
                    <span className="block text-[16px] font-semibold text-ink">Send us a message</span>
                    <span className="mt-0.5 block text-[13px] text-muted">Our team usually replies within a few hours</span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-bg"><Svg d={I.send} size={18} sw={2.2} /></span>
                </button>
                {hasThread && last && (
                  <button type="button" onClick={() => setTab("messages")} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-bg2 px-4 py-3.5 text-left active:bg-forest/40">
                    <Avatar size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2"><span className="text-[13px] font-semibold text-muted">Recent message</span><span className="text-[12px] text-muted">{timeOf(last.created_at)}</span></span>
                      <span className="mt-0.5 block truncate text-[15px] text-ink">{last.sender === "visitor" ? "You: " : ""}{last.body}</span>
                    </span>
                    <span className="text-muted"><Svg d={I.arrow} size={18} /></span>
                  </button>
                )}
                <p className="px-2 pt-2 text-center text-[12px] leading-relaxed text-muted">For your safety never share your password, seed phrase or private keys in chat.</p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-2 border-b border-line bg-bg2 px-2 py-2.5">
                <button type="button" aria-label="Back to home" onClick={() => setTab("home")} className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-forest/50"><Svg d={I.back} size={22} /></button>
                <div className="relative"><Avatar size={40} /><span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg2 bg-accent" /></div>
                <div className="min-w-0 flex-1 pl-1">
                  <p className="font-display text-[17px] font-semibold leading-tight text-ink">Customer agent</p>
                  <p className="text-[12.5px] text-muted">Usually replies within a few hours</p>
                </div>
                <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink/80 active:bg-forest/50"><Svg d={I.down} size={22} /></button>
              </header>

              <div ref={scroller} className="chat-scroll min-h-0 flex-1 overflow-y-auto bg-bg px-4 pb-2 pt-3" aria-live="polite">
                {msgs.length === 0 && (
                  <div className="mx-auto mt-10 max-w-[260px] text-center">
                    <div className="mx-auto mb-3 flex justify-center"><Avatar size={52} /></div>
                    <p className="font-display text-[18px] font-semibold text-ink">Start the conversation</p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-muted">Ask about the EA, licenses, payments or setup. Your chat history is saved here{signedIn ? " and to your account" : " on this device"}.</p>
                  </div>
                )}
                {msgs.map((m, i) => {
                  const mine = m.sender === "visitor";
                  const prev = msgs[i - 1], next = msgs[i + 1];
                  const newDay = !prev || dayOf(prev.created_at) !== dayOf(m.created_at);
                  const firstOfGroup = !prev || prev.sender !== m.sender || newDay;
                  const lastOfGroup = !next || next.sender !== m.sender || dayOf(next.created_at) !== dayOf(m.created_at);
                  const bubble = mine
                    ? `bg-accent text-bg ${firstOfGroup ? "" : "rounded-tr-lg"} ${lastOfGroup ? "rounded-br-md" : "rounded-br-lg"}`
                    : `border border-line bg-bg2 text-ink ${firstOfGroup ? "" : "rounded-tl-lg"} ${lastOfGroup ? "rounded-bl-md" : "rounded-bl-lg"}`;
                  return (
                    <div key={m.k ?? m.id} className="chat-msg">
                      {newDay && <p className="my-4 text-center text-[12px] font-medium text-muted">{dayOf(m.created_at)}</p>}
                      <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${firstOfGroup ? "mt-3" : "mt-1"}`}>
                        {!mine && <div className="w-8 shrink-0">{lastOfGroup && <Avatar size={32} />}</div>}
                        <div className={`flex max-w-[78%] flex-col ${mine ? "items-end" : "items-start"}`}>
                          <div className={`whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-2.5 text-[15px] leading-[1.45] ${bubble} `}>{m.body}</div>
                          {lastOfGroup && (
                            <span className="mt-1 px-1 text-[11.5px] text-muted">
                              {mine ? timeOf(m.created_at) : `${m.is_auto ? "Automatic reply" : "Customer agent"} · ${timeOf(m.created_at)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="chat-msg mt-3 flex items-end gap-2" aria-label="Customer agent is typing">
                    <div className="w-8 shrink-0"><Avatar size={32} /></div>
                    <div className="flex items-center gap-1 rounded-[18px] rounded-bl-md border border-line bg-bg2 px-4 py-3.5">
                      {[0, 1, 2].map((n) => <span key={n} className="chat-dot h-1.5 w-1.5 rounded-full bg-muted" style={{ animationDelay: `${n * 160}ms` }} />)}
                    </div>
                  </div>
                )}
                <div className="h-2" />
              </div>

              <form onSubmit={send} className="shrink-0 border-t border-line bg-bg2 px-3 pb-3 pt-2.5">
                {needsContact && (
                  <div className="mb-2.5 grid grid-cols-2 gap-2">
                    <input className={field} placeholder="Name (optional)" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    <input className={field} placeholder="Email for replies" type="email" inputMode="email" value={email} maxLength={254} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                  </div>
                )}
                {error && <p role="alert" className="mb-2 px-1 text-[13px] text-red-300">{error}</p>}
                <div className="flex items-end gap-2 rounded-[24px] border border-line bg-bg py-1.5 pl-4 pr-1.5 transition-colors duration-200 focus-within:border-accent/70">
                  <textarea ref={area} value={text} onChange={(e) => setText(e.target.value)} rows={1} maxLength={1000} placeholder="Write a message" aria-label="Message"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(hover: hover)").matches) { e.preventDefault(); void send(); } }}
                    className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-[1.4] text-ink placeholder:text-muted/70 focus:outline-none" />
                  <button type="submit" aria-label="Send message" disabled={!text.trim() || sending}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-bg transition-opacity duration-200 disabled:opacity-30 active:brightness-90"><Svg d={I.send} size={20} sw={2.3} /></button>
                </div>
                {needsContact && <p className="mt-2 px-2 text-[12px] leading-snug text-muted">Add your email to be notified when we reply while you are away.</p>}
              </form>
            </>
          )}

          <nav aria-label="Chat sections" className="grid shrink-0 grid-cols-2 border-t border-line bg-bg2">
            {([["home", "Home", I.home], ["messages", "Messages", I.chat]] as const).map(([id, label, d]) => (
              <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? "page" : undefined}
                className={`flex min-h-[54px] flex-col items-center justify-center gap-0.5 text-[12px] font-semibold transition-colors duration-200 ${tab === id ? "text-accent" : "text-muted"}`}>
                <Svg d={d} size={20} />{label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <button type="button" aria-label={open ? "Close chat" : "Open chat"} aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-4 right-4 z-50 h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-[0_10px_30px_-6px_rgba(0,0,0,.6)] transition-transform duration-200 active:scale-95 sm:bottom-5 sm:right-5 ${open ? "hidden sm:flex" : "flex"}`}>
        <Svg d={open ? I.down : I.chat} size={26} />
        {!open && unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-red-500 px-1 text-[11px] font-bold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
    </>
  );
}
