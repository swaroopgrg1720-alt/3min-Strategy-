"use client";
import { useState } from "react";

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

  if (key)
    return (
      <div className="mt-4">
        <p className="text-xs text-muted">Paste this key into the EA&apos;s license input on MT5 account {account}:</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="break-all rounded-lg border border-line bg-bg px-3 py-2 text-sm">{key}</code>
          <button className="btn btn-ghost !py-2" onClick={() => navigator.clipboard?.writeText(key)}>Copy</button>
          <button className="btn btn-ghost !py-2" onClick={() => setKey(null)}>Hide</button>
        </div>
      </div>
    );

  return (
    <form onSubmit={go} className="mt-4">
      {!boundAccount && (
        <label className="block text-sm font-medium">Your MT5 account number
          <input value={account} onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))} inputMode="numeric" required maxLength={12} className="mt-2 w-full max-w-xs rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60" />
        </label>
      )}
      {!boundAccount && <p className="mt-2 text-xs text-amber-300">The key is locked to this account number. Double-check it. Only support can change it later.</p>}
      <button className="btn btn-ghost mt-3 !py-2 disabled:opacity-60" disabled={busy}>{busy ? "Please wait…" : boundAccount ? "Show license key" : "Generate license key"}</button>
      {err && <span role="alert" className="ml-3 text-sm text-red-400">{err}</span>}
    </form>
  );
}
