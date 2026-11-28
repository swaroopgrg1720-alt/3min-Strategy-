"use client";

import { useEffect, useState } from "react";

/** Polls the server for the order status (set only by the verified webhook or the owner). */
export function PaymentStatus({ orderId, renewal = false, indicator = false }: { orderId: string; renewal?: boolean; indicator?: boolean }) {
  const [status, setStatus] = useState("awaiting_payment");
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`);
        if (r.ok && !stop) setStatus((await r.json()).status);
      } catch { /* keep polling */ }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { stop = true; clearInterval(id); };
  }, [orderId]);

  const done = status === "order_complete" || status === "payment_confirmed";
  const review = status === "payment_detected";
  const expired = status === "payment_expired";
  return (
    <div className="card mx-auto max-w-xl text-center" role="status" aria-live="polite">
      <p className="text-xs uppercase tracking-wider text-muted">Order <span className="font-mono">{orderId}</span></p>
      {done ? (
        <>
          <h2 className="mt-3 text-xl font-semibold text-accent">{renewal ? "Renewed! Payment confirmed" : (indicator ? "Payment successful! Thank you for purchasing" : "Thank you for purchasing! Payment confirmed")}</h2>
          <p className="mt-2 text-sm text-muted">{indicator
            ? (renewal ? "Your indicator access has been extended. Open your dashboard to see the new expiry." : "We will now add your TradingView username to the indicator. You will see the status in your dashboard, where it changes to Active when access is ready.")
            : (renewal ? "Your license has been extended. Open My License and copy your new key, because the key changes with the new expiry date." : "Your license is ready. Sign in with the email you used at checkout to view it.")}</p>
          <a className="btn btn-primary mt-5" href={indicator ? "/login?next=/dashboard/indicator" : "/login?next=/dashboard/license"}>{indicator ? "Access indicator" : renewal ? "Open My License" : "Sign in to get your key"}</a>
        </>
      ) : review ? (
        <>
          <h2 className="mt-3 text-xl font-semibold">Payment under review</h2>
          <p className="mt-2 text-sm text-muted">We received a payment that needs a manual check (for example a different amount). We will finish your order shortly, or contact support with your order ID.</p>
        </>
      ) : expired ? (
        <>
          <h2 className="mt-3 text-xl font-semibold">Payment expired</h2>
          <a className="btn btn-primary mt-5" href={indicator ? "/checkout?product=indicator" : "/checkout"}>Start again</a>
        </>
      ) : (
        <>
          <h2 className="mt-3 text-xl font-semibold">Waiting for confirmation…</h2>
          <p className="mt-2 text-sm text-muted">Blockchain payments can take a few minutes. You can keep this page open; it updates by itself.</p>
        </>
      )}
    </div>
  );
}
