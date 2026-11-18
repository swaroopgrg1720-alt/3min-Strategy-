"use client";

import { useState } from "react";
import { plans, type PlanId } from "@/lib/config/pricing";

/** Collects plan + email, creates the order on the server, then sends the customer to the CryptoPayr checkout page. */
export function CryptoCheckout({ initialPlan }: { initialPlan: PlanId }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const p = plans[plan];

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, email }) });
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
        <h2 id="order-summary" className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Product</dt><dd>3MIN SCALP</dd></div>
          <div className="flex justify-between"><dt className="text-muted">License</dt>
            <dd>
              <label className="sr-only" htmlFor="plan">License</label>
              <select id="plan" value={plan} onChange={(e) => setPlan(e.target.value as PlanId)} className="rounded-lg border border-line bg-bg px-3 py-1.5">
                <option value="monthly">Monthly</option><option value="lifetime">Lifetime</option>
              </select>
            </dd>
          </div>
          <div className="flex justify-between"><dt className="text-muted">Price</dt><dd className="font-semibold">{p.priceLabel} {plan === "monthly" ? "/ month" : "one-time"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Payment</dt><dd>Cryptocurrency</dd></div>
        </dl>
      </section>

      <section className="card" aria-labelledby="pay-title">
        <h2 id="pay-title" className="text-lg font-semibold">Pay with crypto</h2>
        <form onSubmit={pay} className="mt-5">
          <label htmlFor="email" className="text-sm text-muted">Email (your license is tied to this address)</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm" />
          <button className="btn btn-primary mt-4 w-full disabled:opacity-60" disabled={busy}>{busy ? "Redirecting…" : `Pay ${p.priceLabel} with crypto`}</button>
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
        <p className="mt-5 rounded-xl bg-forest/30 p-3 text-xs leading-relaxed text-muted">
          You will be taken to a secure CryptoPayr page where you choose your coin and network. Your license is issued automatically once the payment
          is confirmed, never by a button on this page. Then sign in with the same email to get your key.
        </p>
      </section>
    </div>
  );
}
