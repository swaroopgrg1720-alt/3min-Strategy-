import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { addMethodAction, approveOrderAction, deleteMethodAction, rejectOrderAction, toggleMethodAction } from "./actions";

export const metadata: Metadata = { title: "Admin · Payments", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const fmt = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—");
const inp = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm";
const mini = "rounded-lg border border-line px-3 py-1.5 text-xs hover:border-accent/50";
const th = "py-2 pr-4 text-xs font-medium uppercase tracking-wider text-muted";

interface Order {
  order_id: string; customer_email: string; plan: string; amount_usd: number; coin: string; network: string; wallet_address: string | null;
  is_stablecoin: boolean; tx_hash: string | null; proof_note: string | null; submitted_at: string | null; created_at: string;
  order_status: string; reject_reason: string | null; reviewed_at: string | null; reviewed_by: string | null;
}
interface Method { id: string; coin: string; network: string; address: string; is_stablecoin: boolean; instructions: string | null; enabled: boolean }

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error: actionError } = await searchParams;
  const db = supabaseAdmin();
  const [m, o] = await Promise.all([
    db.from("payment_methods").select("*").order("created_at"),
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  const methods = (m.data ?? []) as Method[];
  const orders = (o.data ?? []) as Order[];
  const review = orders.filter((x) => x.order_status === "payment_detected");
  const waiting = orders.filter((x) => x.order_status === "pending");
  const decided = orders.filter((x) => x.order_status === "confirmed" || x.order_status === "failed").slice(0, 20);
  const hashCount = new Map<string, number>();
  orders.forEach((x) => x.tx_hash && hashCount.set(x.tx_hash.toLowerCase(), (hashCount.get(x.tx_hash.toLowerCase()) ?? 0) + 1));
  const dbError = m.error?.message || o.error?.message;

  return (
    <div className="container-x space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="mt-1 text-sm text-muted">Publish payment methods, then approve or reject submitted payments.</p>
        </div>
        <Link href="/admin" className="btn btn-ghost !py-2">← Admin home</Link>
      </div>

      {dbError && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">Database problem: {dbError}. If a table or column is missing, run supabase/migrations/003_manual_payments.sql in the Supabase SQL Editor.</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">Action failed: {actionError}</p>}

      <section className="card" aria-label="Payments to review">
        <h2 className="text-lg font-semibold">To review <span className="ml-2 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-bg">{review.length}</span></h2>
        <p className="mt-1 text-xs text-muted">Check each transaction on the blockchain (right network, right address, full amount) before approving.</p>
        <div className="mt-4 space-y-4">
          {review.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Nothing waiting for review.</p>}
          {review.map((x) => (
            <div key={x.order_id} className="rounded-2xl border border-line bg-bg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm">{x.order_id}</p>
                <p className="text-xs text-muted">Submitted {fmt(x.submitted_at)}</p>
              </div>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <div><dt className="text-xs text-muted">Customer</dt><dd className="break-all">{x.customer_email}</dd></div>
                <div><dt className="text-xs text-muted">Plan / price</dt><dd className="capitalize">{x.plan} · ${x.amount_usd}</dd></div>
                <div><dt className="text-xs text-muted">Method</dt><dd>{x.coin} · {x.network}{x.is_stablecoin ? "" : " (convert)"}</dd></div>
                <div><dt className="text-xs text-muted">Sent to</dt><dd className="break-all font-mono text-xs">{x.wallet_address}</dd></div>
              </dl>
              <div className="mt-3 rounded-xl border border-line bg-bg2 p-3 text-sm">
                <p className="text-xs text-muted">Transaction ID submitted by customer</p>
                <p className="mt-1 break-all font-mono text-xs">{x.tx_hash}</p>
                {x.tx_hash && (hashCount.get(x.tx_hash.toLowerCase()) ?? 0) > 1 && <p className="mt-2 text-xs font-semibold text-amber-300">Warning: this transaction ID was submitted on more than one order.</p>}
                {x.proof_note && <p className="mt-2 text-xs text-muted">Note: {x.proof_note}</p>}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[auto_1fr]">
                <form action={approveOrderAction}><input type="hidden" name="orderId" value={x.order_id} />
                  <button className="btn btn-primary !py-2">Approve &amp; issue license</button></form>
                <form action={rejectOrderAction} className="flex flex-wrap gap-2"><input type="hidden" name="orderId" value={x.order_id} />
                  <input name="reason" required maxLength={300} placeholder="Reason shown to customer (e.g. amount too low)" className={`${inp} min-w-[220px] flex-1`} aria-label="Rejection reason" />
                  <button className="btn btn-ghost !py-2">Reject</button></form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-x-auto" aria-label="Payment methods">
        <h2 className="text-lg font-semibold">Payment methods</h2>
        <p className="mt-1 text-xs text-muted">Only enabled methods appear at checkout. Double-check every address: customers will send real money to it.</p>
        <form action={addMethodAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-muted">Coin<input name="coin" required maxLength={12} placeholder="USDT" className={`${inp} mt-1`} /></label>
          <label className="text-xs text-muted">Network<input name="network" required maxLength={40} placeholder="e.g. TRC20" className={`${inp} mt-1`} /></label>
          <label className="text-xs text-muted sm:col-span-2">Wallet address<input name="address" required maxLength={128} autoComplete="off" className={`${inp} mt-1 font-mono`} /></label>
          <label className="text-xs text-muted sm:col-span-2">Instructions for customer (optional)<input name="instructions" maxLength={500} placeholder="e.g. Send the exact amount. Keep your transaction ID." className={`${inp} mt-1`} /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="stable" defaultChecked className="h-4 w-4" /> Stablecoin (customer sends the USD price 1:1)</label>
          <div><button className="btn btn-primary !py-2">Add method</button></div>
        </form>
        <table className="mt-6 w-full min-w-[640px] text-left text-sm">
          <thead><tr><th className={th}>Coin</th><th className={th}>Network</th><th className={th}>Address</th><th className={th}>Status</th><th className={th}></th></tr></thead>
          <tbody>
            {methods.length === 0 && <tr><td colSpan={5} className="py-6 text-muted">No payment methods yet. Add one so customers can pay.</td></tr>}
            {methods.map((x) => (
              <tr key={x.id} className="border-t border-line">
                <td className="py-3 pr-4 font-medium">{x.coin}</td><td className="py-3 pr-4">{x.network}</td>
                <td className="max-w-[260px] break-all py-3 pr-4 font-mono text-xs">{x.address}</td>
                <td className="py-3 pr-4">{x.enabled ? <span className="text-accent">Live</span> : <span className="text-muted">Hidden</span>}</td>
                <td className="py-3"><div className="flex gap-2">
                  <form action={toggleMethodAction}><input type="hidden" name="id" value={x.id} /><input type="hidden" name="enable" value={x.enabled ? "0" : "1"} /><button className={mini}>{x.enabled ? "Hide" : "Show"}</button></form>
                  <form action={deleteMethodAction}><input type="hidden" name="id" value={x.id} /><button className={mini}>Delete</button></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto" aria-label="Orders awaiting payment">
        <h2 className="text-lg font-semibold">Awaiting payment <span className="ml-2 text-sm font-normal text-muted">({waiting.length})</span></h2>
        <table className="mt-3 w-full min-w-[560px] text-left text-sm">
          <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Plan</th><th className={th}>Method</th><th className={th}>Created</th></tr></thead>
          <tbody>
            {waiting.length === 0 && <tr><td colSpan={5} className="py-5 text-muted">None.</td></tr>}
            {waiting.map((x) => (<tr key={x.order_id} className="border-t border-line"><td className="py-2 pr-4 font-mono text-xs">{x.order_id}</td><td className="py-2 pr-4">{x.customer_email}</td><td className="py-2 pr-4 capitalize">{x.plan} · ${x.amount_usd}</td><td className="py-2 pr-4">{x.coin} · {x.network}</td><td className="py-2">{fmt(x.created_at)}</td></tr>))}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto" aria-label="Recent decisions">
        <h2 className="text-lg font-semibold">Recent decisions</h2>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Result</th><th className={th}>By</th><th className={th}>When</th></tr></thead>
          <tbody>
            {decided.length === 0 && <tr><td colSpan={5} className="py-5 text-muted">None yet.</td></tr>}
            {decided.map((x) => (
              <tr key={x.order_id} className="border-t border-line">
                <td className="py-2 pr-4 font-mono text-xs">{x.order_id}</td><td className="py-2 pr-4">{x.customer_email}</td>
                <td className="py-2 pr-4">{x.order_status === "confirmed" ? <span className="text-accent">Approved</span> : <span className="text-red-400" title={x.reject_reason ?? undefined}>Rejected{x.reject_reason ? `: ${x.reject_reason}` : ""}</span>}</td>
                <td className="py-2 pr-4 text-muted">{x.reviewed_by ?? "—"}</td><td className="py-2">{fmt(x.reviewed_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
