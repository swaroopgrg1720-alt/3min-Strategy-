"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type State = "idle" | "sending" | "sent" | "error";

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setState("sending");
    setMsg("");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setState("error"); setMsg(error.message); } else setState("sent");
  }

  if (state === "sent")
    return (
      <div role="status" className="mt-8 rounded-2xl border border-accent/30 bg-forest/30 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-bg text-accent" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </div>
        <p className="mt-4 font-semibold">Check your email</p>
        <p className="mt-1 text-sm text-muted">We sent a one-time sign-in link to <span className="text-ink">{email}</span>. It can be used once and expires soon.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
          <button onClick={() => send()} className="btn btn-ghost !py-2">Send a new link</button>
          <button onClick={() => setState("idle")} className="btn btn-ghost !py-2">Use a different email</button>
        </div>
      </div>
    );

  return (
    <form onSubmit={send} className="mt-8 space-y-5">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium">Email address</label>
        <div className="relative mt-2">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
          <input id="login-email" type="email" required autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg py-3.5 pl-11 pr-4 text-sm placeholder:text-muted/60 focus:border-accent/60" />
        </div>
      </div>
      <button className="btn btn-primary w-full !py-3.5 disabled:opacity-60" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send one-time link"}
      </button>
      {state === "error" && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">{msg}</p>}
    </form>
  );
}
