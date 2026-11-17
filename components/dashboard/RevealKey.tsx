"use client";
import { useState } from "react";

export function RevealKey({ licenseId }: { licenseId: string }) {
  const [key, setKey] = useState<string | null>(null);
  const [err, setErr] = useState("");
  async function reveal() {
    setErr("");
    const r = await fetch("/api/license/reveal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ licenseId }) });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setKey(d.key); else setErr(d.error || "Could not load key.");
  }
  return key ? (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <code className="break-all rounded-lg border border-line bg-bg px-3 py-2 text-sm">{key}</code>
      <button className="btn btn-ghost !py-2" onClick={() => navigator.clipboard?.writeText(key)}>Copy</button>
      <button className="btn btn-ghost !py-2" onClick={() => setKey(null)}>Hide</button>
    </div>
  ) : (
    <div className="mt-2"><button className="btn btn-ghost !py-2" onClick={reveal}>Show license key</button>{err && <span role="alert" className="ml-3 text-sm text-red-400">{err}</span>}</div>
  );
}
