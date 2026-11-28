"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MAX_MONTHS, indicator, indicatorEnabled, indicatorPlanAvailable, indicatorPlanPrice, indicatorTotalUsd, isTvUsername, orderTotalUsd, plans, type PlanId, type ProductId } from "@/lib/config/pricing";

const QUICK = [1, 2, 3, 6, 12];

/**
 * Plan + months (+ email for guests), then redirect to the CryptoPayr checkout.
 * With `dashboard` set, the signed-in account email is used (server-side) and no email is asked for.
 */
export interface RenewTarget { id: string; ref: string; expires: string | null }
/** Renewing one TradingView indicator access (the username is already on file). */
export interface RenewAccess { id: string; username: string; expires: string | null }
const dayStr = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function CryptoCheckout({ initialPlan, initialProduct = "ea", dashboard = false, accountEmail, renew, renewAccess }: { initialPlan: PlanId; initialProduct?: ProductId; dashboard?: boolean; accountEmail?: string; renew?: RenewTarget; renewAccess?: RenewAccess }) {
  const renewing = !!(renew || renewAccess);
  const [product, setProduct] = useState<ProductId>(renewAccess ? "indicator" : initialProduct === "indicator" && indicatorEnabled ? "indicator" : "ea");
  const ind = product === "indicator";
  const [tv, setTv] = useState("");
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState<PlanId>(renewing ? "monthly" : initialPlan);
  const [months, setMonths] = useState(1);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const total = ind ? indicatorTotalUsd(plan, months) : orderTotalUsd(plan, months);
  const planOk = (id: PlanId) => !ind || indicatorPlanAvailable(id);
  const priceText = (id: PlanId) => (ind ? `$${indicatorPlanPrice(id)}` : plans[id].priceLabel);
  const pickProduct = (next: ProductId) => { setProduct(next); const ok = (id: PlanId) => next === "ea" || indicatorPlanAvailable(id); if (!ok(plan)) setPlan(plan === "monthly" ? "lifetime" : "monthly"); setError(""); };
  const clamp = (n: number) => Math.min(MAX_MONTHS, Math.max(1, n));

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (ind && !agree) throw new Error("Please accept the terms and the refund policy to continue.");
      if (ind && !renewAccess && !isTvUsername(tv.trim().replace(/^@/, ""))) throw new Error("Enter your TradingView username (letters, numbers and underscores, 3 to 30 characters).");
      const who = dashboard ? { from: "dashboard" } : { email };
      const payload = renewAccess ? { product: "indicator", plan: "monthly", months, from: "dashboard", accessId: renewAccess.id }
        : renew ? { plan: "monthly", months, from: "dashboard", licenseId: renew.id }
        : ind ? { product: "indicator", plan, months, tvUsername: tv.trim().replace(/^@/, ""), ...who }
        : { plan, months, ...who };
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
        <h2 id="order-summary" className="text-lg font-semibold">{renew ? "Renew this license" : renewAccess ? "Renew indicator access" : "Choose your product"}</h2>
        {!renewing && (
          <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Product">
            <button type="button" aria-pressed={!ind} onClick={() => pickProduct("ea")} className={`btn !py-2.5 ${!ind ? "btn-primary" : "btn-ghost"}`}>MT5 Expert Advisor</button>
            <button type="button" aria-pressed={ind} disabled={!indicatorEnabled} onClick={() => pickProduct("indicator")} className={`btn !py-2.5 disabled:opacity-60 ${ind ? "btn-primary" : "btn-ghost"}`}>{indicatorEnabled ? "TradingView Indicator" : "Indicator (soon)"}</button>
          </div>
        )}
        {renewAccess && (
          <div className="mt-4 rounded-2xl border border-accent/30 bg-forest/20 p-4">
            <p className="font-mono text-sm text-accent">@{renewAccess.username}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Expires now</dt><dd className="font-medium">{renewAccess.expires ? dayStr(Date.parse(renewAccess.expires)) : "Not started"}</dd></div>
              <div><dt className="text-muted">New expiry</dt><dd className="font-semibold text-accent">{renewAccess.expires ? dayStr(Math.max(Date.now(), Date.parse(renewAccess.expires)) + months * 30 * 86_400_000) : `${months * 30} days after access starts`}</dd></div>
            </dl>
          </div>
        )}
        {renew && (
          <div className="mt-4 rounded-2xl border border-accent/30 bg-forest/20 p-4">
            <p className="font-mono text-sm text-accent">{renew.ref}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted">Expires now</dt><dd className="font-medium">{renew.expires ? dayStr(Date.parse(renew.expires)) : "—"}</dd></div>
              <div><dt className="text-muted">New expiry</dt><dd className="font-semibold text-accent">{dayStr(Math.max(Date.now(), renew.expires ? Date.parse(renew.expires) : 0) + months * 30 * 86_400_000)}</dd></div>
            </dl>
          </div>
        )}
        <div className={`mt-5 grid gap-2 ${renewing ? "hidden" : ""} ${(["monthly", "lifetime"] as PlanId[]).filter(planOk).length > 1 ? "grid-cols-2" : "grid-cols-1"}`} role="group" aria-label="Plan">
          {(["monthly", "lifetime"] as PlanId[]).filter(planOk).map((id) => (
            <button key={id} type="button" aria-pressed={plan === id} onClick={() => setPlan(id)} className={`btn !py-2.5 ${plan === id ? "btn-primary" : "btn-ghost"}`}>
              {plans[id].name} · {priceText(id)}
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
          <div className="flex justify-between"><dt className="text-muted">Product</dt><dd>{ind ? indicator.name : "3MIN SCALP"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Duration</dt><dd>{plan === "lifetime" ? "Lifetime" : `${months} ${months === 1 ? "month" : "months"} (${months * 30} days)`}</dd></div>
          <div className="flex justify-between text-base"><dt className="text-muted">Total</dt><dd className="font-semibold text-accent">${total.toFixed(2)} USD</dd></div>
        </dl>
      </section>

      <section className="card" aria-labelledby="pay-title">
        <h2 id="pay-title" className="text-lg font-semibold">{renewing ? "Pay to renew" : dashboard ? "Pay from your account" : "Pay with crypto"}</h2>
        <form onSubmit={pay} className="mt-5">
          {renewAccess ? (
            <p className="text-sm text-muted">The time is added to the same access for <span className="font-mono text-ink">@{renewAccess.username}</span>. Nothing else changes.</p>
          ) : renew ? (
            <p className="text-sm text-muted">The time is added to <span className="font-mono text-ink">{renew.ref}</span>, the same license and the same MT5 account. No new license is created.</p>
          ) : (
            <>
              {ind && (
                <div className="mb-4">
                  <label htmlFor="tv" className="text-sm text-muted">Your TradingView username</label>
                  <input id="tv" required value={tv} onChange={(e) => setTv(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={40} placeholder="e.g. mytradingname"
                    className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm" />
                  <p className="mt-1.5 text-xs text-muted">It is the name in your TradingView profile address (tradingview.com/u/<span className="text-ink">username</span>). Access is added to exactly this username, so check it carefully.</p>
                </div>
              )}
              {ind && (
                <label className="mb-4 flex items-start gap-2.5 text-sm text-muted">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#00E59B]" />
                  <span>I accept the <a className="text-accent underline" href="/terms" target="_blank" rel="noopener noreferrer">terms</a> and the <a className="text-accent underline" href="/refund-policy" target="_blank" rel="noopener noreferrer">refund policy</a>. I understand trading is risky and the indicator does not guarantee profit.</span>
                </label>
              )}
              {dashboard ? (
                <p className="text-sm text-muted">{ind ? "This is billed to" : "This creates a new license (one license works on one MT5 account) for"} <span className="text-ink">{accountEmail}</span>. {plan === "monthly" ? "To extend something you already have, use its Renew button instead." : "It never expires."}</p>
              ) : (
                <>
                  <label htmlFor="email" className="text-sm text-muted">Email ({ind ? "you will see your access here with this address" : "your license is tied to this address"})</label>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="mt-2 w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm" />
                </>
              )}
            </>
          )}
          <button className="btn btn-primary mt-4 w-full disabled:opacity-60" disabled={busy}>{busy ? <><Spinner size={18} /> Taking you to payment…</> : renewing ? `Renew for $${total.toFixed(2)}` : `Pay $${total.toFixed(2)} with crypto`}</button>
          {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
        </form>
        <p className="mt-5 rounded-xl bg-forest/30 p-3 text-xs leading-relaxed text-muted">
          You will be taken to a secure CryptoPayr page where you choose your coin and network. {ind ? "After the payment is confirmed we add your TradingView username to the indicator. This is done by hand, and the status shows in your dashboard." : "Your license is issued automatically once the payment is confirmed, never by a button on this page."}
        </p>
      </section>
    </div>
  );
}
