"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setState("sending");
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setState("error"); setMsg(error.message); } else setState("sent");
  }

  if (state === "sent")
    return <p role="status" className="mt-6 rounded-xl border border-accent/30 bg-forest/30 p-4 text-sm text-accent">Check your email for a secure sign-in link.</p>;

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">Email
        <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60" />
      </label>
      <button className="btn btn-primary w-full disabled:opacity-60" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Email me a sign-in link"}</button>
      {state === "error" && <p role="alert" className="text-sm text-red-400">{msg}</p>}
      <p className="text-xs text-muted">Use the email you purchased with. No password needed.</p>
    </form>
  );
}
