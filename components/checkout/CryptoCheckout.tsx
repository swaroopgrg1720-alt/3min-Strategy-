"use client";
import { useCallback, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { plans, type PlanId } from "@/lib/config/pricing";
import { ORDER_VIEW_LABEL, type OrderView } from "@/lib/orders/status";

interface Method { id: string; coin: string; network: string; is_stablecoin: boolean; instructions: string | null }
interface Order {
  orderId: string; plan: PlanId; amountUsd: number; coin: string; network: string; walletAddress: string;
  isStablecoin: boolean; payNote: string | null; status: OrderView; txHash: string | null; rejectReason: string | null;
  expiresAt: string | null; email: string;
}

const field = "mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm focus:border-accent/60";
const fmtClock = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
const STATUS_TONE: Record<OrderView, string> = {
  awaiting_payment: "text-amber-300", under_review: "text-accent", approved: "text-accent", rejected: "text-red-400", expired: "text-red-400", refunded: "text-muted",
};

/**
 * Manual crypto checkout. The customer pays to an address the owner published, then reports the transaction ID.
 * Nothing is approved here: the owner verifies the payment on-chain and approves it in the admin panel.
 */
export function CryptoCheckout({ initialPlan, initialOrderId }: { initialPlan: PlanId; initialOrderId?: string }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const [methods, setMethods] = useState<Method[] | null>(null);
  const [methodId, setMethodId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tx, setTx] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch("/api/payment-methods").then((r) => r.json()).then((d) => {
      const list: Method[] = d.methods ?? [];
      setMethods(list);
      if (list[0]) setMethodId(list[0].id);
    }).catch(() => setMethods([]));
  }, []);

  const refresh = useCallback(async (id: string) => {
    const r = await fetch(`/api/orders/status?orderId=${encodeURIComponent(id)}`);
    if (r.ok) { const d = await r.json(); setOrder(d.order); }
  }, []);

  useEffect(() => { if (initialOrderId) refresh(initialOrderId); }, [initialOrderId, refresh]);

  const orderId = order?.orderId;
  const finished = order?.status === "approved" || order?.status === "refunded";
  useEffect(() => {
    if (!orderId || finished) return;
    const poll = setInterval(() => refresh(orderId), 10_000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [orderId, finished, refresh]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, methodId, email }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not create the order.");
      setOrder(d.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  async function submitTx(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/orders/submit-payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: order.orderId, txHash: tx, note }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Could not submit.");
      setOrder(d.order); setTx(""); setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally { setBusy(false); }
  }

  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  }

  const p = plans[order?.plan ?? plan];
  const secondsLeft = order?.expiresAt ? Math.max(0, Math.floor((new Date(order.expiresAt).getTime() - now) / 1000)) : 0;
  const canSubmit = !!order && (order.status === "awaiting_payment" || order.status === "expired" || order.status === "rejected");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
      <section className="card" aria-labelledby="order-summary">
        <h2 id="order-summary" className="text-lg font-semibold">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Product</dt><dd>3MIN SCALP</dd></div>
          <div className="flex items-center justify-between"><dt className="text-muted">License</dt>
            <dd>
              <label className="sr-only" htmlFor="plan">License</label>
              <select id="plan" value={order?.plan ?? plan} disabled={!!order} onChange={(e) => setPlan(e.target.value as PlanId)} className="rounded-lg border border-line bg-bg px-3 py-1.5">
                <option value="monthly">Monthly</option><option value="lifetime">Lifetime</option>
              </select>
            </dd>
          </div>
          <div className="flex justify-between"><dt className="text-muted">Price</dt><dd className="font-semibold">{p.priceLabel} {p.id === "monthly" ? "/ month" : "one-time"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Payment method</dt><dd>Cryptocurrency</dd></div>
        </dl>

        {!order && (
          <form onSubmit={create} className="mt-6">
            {methods === null ? <p className="text-sm text-muted">Loading payment methods…</p> : methods.length === 0 ? (
              <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">Payments are not open yet. Please check back soon or contact support.</p>
            ) : (
              <>
                <label className="block text-sm">Pay with
                  <select value={methodId} onChange={(e) => setMethodId(e.target.value)} className={field}>
                    {methods.map((m) => <option key={m.id} value={m.id}>{m.coin} · {m.network}</option>)}
                  </select>
                </label>
                <label className="mt-4 block text-sm">Email (your license is tied to this address)
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={field} />
                </label>
                <button className="btn btn-primary mt-5 w-full disabled:opacity-60" disabled={busy}>{busy ? "Creating order…" : "Continue to payment"}</button>
              </>
            )}
            {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
          </form>
        )}
        {order && <p className="mt-6 rounded-xl bg-forest/30 p-3 text-xs leading-relaxed text-muted">Order <span className="font-mono text-ink">{order.orderId}</span> for {order.email}. Save this order ID. You can return from <a className="text-accent underline" href="/dashboard/orders">My Orders</a> after signing in.</p>}
      </section>

      <section className="card" aria-labelledby="pay-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="pay-title" className="text-lg font-semibold">Payment instructions</h2>
          {order && <span className={`text-sm font-semibold ${STATUS_TONE[order.status]}`} role="status" aria-live="polite">{ORDER_VIEW_LABEL[order.status]}</span>}
        </div>

        {!order ? (
          <p className="mt-5 text-sm text-muted">Choose a payment method and enter your email. The wallet address and exact amount appear here.</p>
        ) : order.status === "approved" ? (
          <div className="mt-5 rounded-2xl border border-accent/30 bg-forest/30 p-5">
            <p className="font-semibold">Payment approved. Your license is ready.</p>
            <p className="mt-1 text-sm text-muted">Sign in with <span className="text-ink">the email you used</span> to see your license and download the EA.</p>
            <a href="/login?next=/dashboard/license" className="btn btn-primary mt-4">Sign in to get my license</a>
          </div>
        ) : (
          <>
            <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="shrink-0 rounded-xl bg-white p-3" aria-label="QR code of the wallet address" role="img">
                <QRCodeSVG value={order.walletAddress} size={140} level="M" />
              </div>
              <dl className="w-full space-y-3 text-sm">
                <div><dt className="text-xs text-muted">Amount</dt>
                  <dd className="font-semibold">{order.isStablecoin ? `${order.amountUsd.toFixed(2)} ${order.coin}` : `${order.amountUsd.toFixed(2)} USD worth of ${order.coin} (at the current market rate)`}</dd></div>
                <div><dt className="text-xs text-muted">Network</dt><dd className="font-semibold">{order.network}</dd></div>
                <div><dt className="text-xs text-muted">Wallet address</dt>
                  <dd className="break-all rounded-lg border border-line bg-bg px-3 py-2 font-mono text-xs">{order.walletAddress}</dd>
                  <button type="button" onClick={() => copy(order.walletAddress)} className="mt-2 text-xs text-accent underline">{copied ? "Copied" : "Copy address"}</button></div>
              </dl>
            </div>
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-300">
              Send only <strong>{order.coin}</strong> on the <strong>{order.network}</strong> network. Funds sent on another network may be lost and cannot be recovered. {order.payNote}
            </p>
            {order.status === "awaiting_payment" && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-bg px-4 py-3 text-sm">
                <span className="text-muted">Payment window</span><span className="font-mono text-lg font-semibold" role="timer" aria-live="off">{fmtClock(secondsLeft)}</span>
              </div>
            )}

            {order.status === "rejected" && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">Your payment was rejected{order.rejectReason ? `: ${order.rejectReason}` : "."} If you believe this is a mistake, submit the correct transaction ID below or contact support.</p>}
            {order.status === "expired" && <p className="mt-4 rounded-xl border border-line bg-bg p-3 text-sm text-muted">The payment window has ended. If you already sent the payment, submit your transaction ID below and we will review it.</p>}

            {order.status === "under_review" ? (
              <div className="mt-5 rounded-2xl border border-accent/30 bg-forest/30 p-5 text-sm">
                <p className="font-semibold">Payment submitted. We are checking the blockchain.</p>
                <p className="mt-1 break-all text-xs text-muted">Transaction ID: {order.txHash}</p>
                <p className="mt-2 text-muted">You do not need to do anything else. This page updates when your payment is approved, and your license will appear after you sign in.</p>
              </div>
            ) : canSubmit && (
              <form onSubmit={submitTx} className="mt-5 border-t border-line pt-5">
                <h3 className="text-sm font-semibold">After you have sent the payment</h3>
                <label className="mt-3 block text-sm">Transaction ID (hash)
                  <input required minLength={8} maxLength={140} value={tx} onChange={(e) => setTx(e.target.value)} autoComplete="off" className={`${field} font-mono`} />
                </label>
                <label className="mt-3 block text-sm">Note (optional)
                  <input maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} className={field} />
                </label>
                <button className="btn btn-primary mt-4 w-full disabled:opacity-60" disabled={busy}>{busy ? "Submitting…" : "Submit payment for review"}</button>
                {error && <p role="alert" className="mt-3 text-sm text-red-400">{error}</p>}
                <p className="mt-3 text-xs leading-relaxed text-muted">Submitting does not approve your order. We verify every payment on the blockchain before issuing your license.</p>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
