"use client";

import { useEffect, useMemo, useState } from "react";
import { cryptoOptions, PAYMENT_STATUS_LABELS, PAYMENT_WINDOW_SECONDS, WALLET_PLACEHOLDER, type Coin, type PaymentStatus } from "@/lib/config/payments";
import { plans, type PlanId } from "@/lib/config/pricing";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

/**
 * Preview checkout. It does NOT create real orders or confirm payments.
 * There is intentionally no "I have paid" button: status must come from the server (webhook-verified).
 */
export function CryptoCheckout({ initialPlan }: { initialPlan: PlanId }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const enabled = useMemo(() => cryptoOptions.filter((o) => o.enabled), []);
  const [coin, setCoin] = useState<Coin>(enabled[0].coin);
  const networks = enabled.find((o) => o.coin === coin)?.networks ?? [];
  const [network, setNetwork] = useState(networks[0] ?? "");
  const [seconds, setSeconds] = useState(PAYMENT_WINDOW_SECONDS);
  const [status] = useState<PaymentStatus>("awaiting_payment");

  useEffect(() => setNetwork(networks[0] ?? ""), [coin]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const p = plans[plan];
  const shownStatus = seconds === 0 ? PAYMENT_STATUS_LABELS.payment_expired : PAYMENT_STATUS_LABELS[status];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
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
          <div className="flex justify-between"><dt className="text-muted">Payment method</dt><dd>Cryptocurrency</dd></div>
        </dl>
        <fieldset className="mt-6">
          <legend className="text-sm text-muted">Cryptocurrency</legend>
          <div className="mt-2 flex gap-2">
            {enabled.map((o) => (
              <button key={o.coin} type="button" aria-pressed={coin === o.coin} onClick={() => setCoin(o.coin)} className={`btn !py-2 ${coin === o.coin ? "btn-primary" : "btn-ghost"}`}>{o.coin}</button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5">
          <label htmlFor="network" className="text-sm text-muted">Network</label>
          <select id="network" value={network} onChange={(e) => setNetwork(e.target.value)} className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm">
            {networks.map((n) => (<option key={n}>{n}</option>))}
          </select>
          <p className="mt-2 text-xs text-muted">Networks are configurable in <code>lib/config/payments.ts</code>.</p>
        </div>
      </section>

      <section className="card" aria-labelledby="pay-title">
        <div className="flex items-center justify-between">
          <h2 id="pay-title" className="text-lg font-semibold">Payment instructions</h2>
          <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">Preview — no real payment</span>
        </div>
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-line bg-bg text-center text-[11px] text-muted" role="img" aria-label="QR code placeholder">QR CODE<br />PLACEHOLDER</div>
          <dl className="w-full space-y-3 text-sm">
            <div><dt className="text-xs text-muted">Amount</dt><dd className="font-semibold">{p.priceUsd.toFixed(2)} USD in {coin}</dd></div>
            <div><dt className="text-xs text-muted">Wallet address</dt><dd className="break-all rounded-lg border border-line bg-bg px-3 py-2 font-mono text-xs">{WALLET_PLACEHOLDER}</dd></div>
            <div><dt className="text-xs text-muted">Order ID</dt><dd className="font-mono text-xs">ORD-PREVIEW</dd></div>
          </dl>
        </div>
        <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3 text-sm">
          <span className="text-muted">Payment window</span>
          <span className="font-mono text-lg font-semibold" role="timer" aria-live="off">{fmt(seconds)}</span>
        </div>
        <p className="mt-4 text-sm" role="status" aria-live="polite">Status: <span className="font-semibold text-accent">{shownStatus === "Awaiting Payment" ? "Waiting for payment" : shownStatus}</span></p>
        <ol className="mt-4 space-y-1 text-xs text-muted">
          <li>Awaiting Payment → Payment Detected → Payment Confirmed → Order Complete</li>
          <li>After confirmation: “Payment confirmed. Your license is being prepared.”</li>
        </ol>
        <p className="mt-5 rounded-xl bg-forest/30 p-3 text-xs leading-relaxed text-muted">
          Payments are confirmed server-side from the blockchain / payment provider, never by a button on this page.
          Do not send funds until live payment processing is enabled.
        </p>
      </section>
    </div>
  );
}
