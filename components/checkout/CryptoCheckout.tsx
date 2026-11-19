"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MAX_MONTHS, orderTotalUsd, plans, type PlanId } from "@/lib/config/pricing";

const QUICK = [1, 2, 3, 6, 12];

/**
 * Plan + months (+ email for guests), then redirect to the CryptoPayr checkout.
 * With `dashboard` set, the signed-in account email is used (server-side) and no email is asked for.
 */
export function CryptoCheckout({ initialPlan, dashboard = false, accountEmail }: { initialPlan: PlanId; dashboard?: boolean; accountEmail?: string }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [months, setMonths] = useState(1);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = orderTotalUsd(plan, months);
  const clamp = (n: number) => Math.min(MAX_MONTHS, Math.max(1, n));

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = dashboard ? { plan, months, from: "dashboard" } : { plan, months, email };
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.checkoutUrl) throw new Error(d.error || "Could not start the payment.");
      window.location.href = d.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
      <section className="card" aria-labelledby="order-summary">
        <h2 id="order-summary" className="text-lg font-semibold">Choose your license</h2>
        <div className="mt-5 grid grid-cols-2 gap-2" role="group" aria-label="License type">
          {(["monthly", "lifetime"] as PlanId[]).map((id) => (
            <button key={id} type="button" aria-pressed={plan === id} onClick={() => setPlan(id)} className={`btn !py-2.5 ${plan === id ? "btn-primary" : "btn-ghost"}`}>
              {plans[id].name} · {plans[id].priceLabel}
            </button>
          ))}
        </div>

        {plan === "monthly" && (
          <div className="mt-5">
            <label htmlFor="months" className="text-sm text-muted">How many months?</label>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" aria-label="One month less" onClick={() => setMonths(clamp(months - 1))} className="btn btn-ghost !px-4 !py-2" disabled={months <= 1}>−</button>
              <input id="months" inputMode="numeric" value={months} onChange={(e) => setMonths(clamp(parseInt(e.target.value.replace(/\D/g, ""), 10) || 1))}
                className="w-16 rounded-lg border border-line bg-bg px-3 py-2 text-center text-sm font-semibold" />
              <button type="button" aria-label="One month more" onClick={() => setMonths(clamp(months + 1))} className="btn btn-ghost !px-4 !py-2" disabled={months >= MAX_MONTHS}>+</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK.map((m) => (
                <button key={m} type="button" aria-pressed={months === m} onClick={() => setMonths(m)} className={`rounded-lg border px-3 py-1 text-xs ${months === m ? "border-accent text-accent" : "border-line text-muted"}`}>{m} {m === 1 ? "month" : "months"}</button>
              ))}
            </div>
          </div>
        )}

        <dl className="mt-6 space-y-3 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Product</dt><dd>3MIN SCALP</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Duration</dt><dd>{plan === "lifetime" ? "Lifetime" : `${months} ${months === 1 ? "month" : "months"} (${months * 30} days)`}</dd></div>
          <div className="flex justify-between text-base"><dt className="text-muted">Total</dt><dd className="font-semibold text-accent">${total.toFixed(2)} USD</dd></div>
        </dl>
      </section>

      <section className="card" aria-labelledby="pay-title">
        <h2 id="pay-title" className="text-lg font-semibold">{dashboard ? "Pay from your account" : "Pay with crypto"}</h2>
        <form onSubmit={pay} className="mt-5">
          {dashboard ? (
            <p className="text-sm text-muted">License for <span className="text-ink">{accountEmail}</span>. {plan === "monthly" ? "If you already have a monthly license, the time is added to it." : "Lifetime license for this account."}</p>
          ) : (
            <>
              <label htmlFor="email" className="text-sm text-muted">Email (your license is tied to this address)</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm" />
            </>
          )}
          <button className="btn btn-primary mt-4 w-full disabled:opacity-60" disabled={busy}>{busy ? <><Spinner size={18} /> Taking you to payment…</> : `Pay $${total.toFixed(2)} with crypto`}</button>
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
        <p className="mt-5 rounded-xl bg-forest/30 p-3 text-xs leading-relaxed text-muted">
          You will be taken to a secure CryptoPayr page where you choose your coin and network. Your license is issued automatically once the payment is confirmed, never by a button on this page.
        </p>
      </section>
    </div>
  );
}
