"use client";

import { useEffect, useState } from "react";

/** Polls the server for the order status (set only by the verified webhook or the owner). */
export function PaymentStatus({ orderId }: { orderId: string }) {
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
          <h2 className="mt-3 text-xl font-semibold text-accent">Thank you for purchasing! Payment confirmed</h2>
          <p className="mt-2 text-sm text-muted">Your license is ready. Sign in with the email you used at checkout to view it.</p>
          <a className="btn btn-primary mt-5" href="/login?next=/dashboard/license">Sign in to get your key</a>
        </>
      ) : review ? (
        <>
          <h2 className="mt-3 text-xl font-semibold">Payment under review</h2>
          <p className="mt-2 text-sm text-muted">We received a payment that needs a manual check (for example a different amount). We will issue your license shortly, or contact support with your order ID.</p>
        </>
      ) : expired ? (
        <>
          <h2 className="mt-3 text-xl font-semibold">Payment expired</h2>
          <a className="btn btn-primary mt-5" href="/checkout">Start again</a>
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
