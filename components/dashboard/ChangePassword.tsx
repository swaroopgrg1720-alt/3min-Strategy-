"use client";
import { useState } from "react";
import { changePassword } from "@/app/dashboard/account/actions";
import { PASSWORD_RULES, passwordScore } from "@/lib/auth/password";

const field = "min-h-[48px] w-full rounded-xl border border-line bg-bg px-4 text-[16px] focus:border-accent/70 focus:outline-none";

export function ChangePassword() {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ ok: boolean; message: string } | null>(null);
  const score = passwordScore(next);
  const tone = score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-300" : "bg-accent";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setRes(null);
    try { const r = await changePassword(cur, next); setRes(r); if (r.ok) { setCur(""); setNext(""); } }
    catch { setRes({ ok: false, message: "Something went wrong. Please try again." }); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div><label htmlFor="cp-cur" className="text-sm font-medium">Current password</label>
        <input id="cp-cur" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} className={`${field} mt-2`} /></div>
      <div><label htmlFor="cp-new" className="text-sm font-medium">New password</label>
        <input id="cp-new" type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} maxLength={128} className={`${field} mt-2`} />
        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 rounded-full ${next && score >= n ? tone : "bg-line"}`} />)}</div>
        <ul className="mt-3 grid gap-1 text-[13px] sm:grid-cols-2">{PASSWORD_RULES.map((r) => <li key={r.id} className={r.test(next) ? "text-accent" : "text-muted"}>{r.test(next) ? "✓" : "○"} {r.label}</li>)}</ul></div>
      <button disabled={busy} className="inline-flex min-h-[48px] items-center rounded-full bg-accent px-6 text-sm font-semibold text-bg active:brightness-95 disabled:opacity-60">{busy ? "Saving…" : "Change password"}</button>
      {res && <p role={res.ok ? "status" : "alert"} className={`rounded-xl border p-3 text-sm ${res.ok ? "border-accent/30 bg-forest/30 text-ink" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>{res.message}</p>}
    </form>
  );
}
