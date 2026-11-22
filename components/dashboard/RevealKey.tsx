"use client";
import { useState } from "react";
import { CopyButton } from "@/components/dashboard/CopyButton";

export function RevealKey({ licenseId, boundAccount }: { licenseId: string; boundAccount: string | null }) {
  const [key, setKey] = useState<string | null>(null);
  const [account, setAccount] = useState(boundAccount ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await fetch("/api/license/ea-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ licenseId, account }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setKey(d.key); else setErr(d.error || "Could not create the key.");
    } finally {
      setBusy(false);
    }
  }

  const btn = "inline-flex min-h-[44px] items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-ink active:bg-forest/40";

  if (key)
    return (
      <div className="mt-5 rounded-2xl border border-accent/30 bg-forest/20 p-4">
        <p className="text-sm font-semibold text-ink">Your license key</p>
        <p className="mt-0.5 text-xs text-muted">Paste it into the EA&apos;s license input on MT5 account <span className="font-mono text-ink">{account}</span>.</p>
        <code className="mt-3 block break-all rounded-xl border border-line bg-bg px-4 py-3 font-mono text-[13px] leading-relaxed text-accent">{key}</code>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton value={key} label="Copy key" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-bg active:brightness-95" />
          <button type="button" className={btn} onClick={() => setKey(null)}>Hide</button>
        </div>
      </div>
    );

  return (
    <form onSubmit={go} className="mt-5 rounded-2xl border border-line bg-bg p-4">
      {!boundAccount ? (
        <>
          <label className="block text-sm font-semibold text-ink" htmlFor={`acc-${licenseId}`}>Your MT5 account number</label>
          <input id={`acc-${licenseId}`} value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" required maxLength={12} placeholder="e.g. 12345678"
            className="mt-2 min-h-[48px] w-full max-w-xs rounded-xl border border-line bg-bg2 px-4 text-[16px] focus:border-accent/60 focus:outline-none" />
          <p className="mt-2 text-xs leading-relaxed text-amber-300">The key is locked to this account number. Double-check it, because only support can change it later.</p>
        </>
      ) : (
        <p className="text-sm text-muted">Locked to MT5 account <span className="font-mono text-ink">{boundAccount}</span>.</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-bg active:brightness-95 disabled:opacity-60" disabled={busy}>
          {busy ? "Please wait…" : boundAccount ? "Show license key" : "Generate license key"}
        </button>
        {err && <span role="alert" className="text-sm text-red-300">{err}</span>}
      </div>
    </form>
  );
}
