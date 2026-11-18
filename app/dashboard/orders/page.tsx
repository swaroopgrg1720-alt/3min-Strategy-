import type { Metadata } from "next";
import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
import { supabaseServer } from "@/lib/supabase/server";
import { deriveStatus, ORDER_VIEW_LABEL, type OrderView } from "@/lib/orders/status";

export const metadata: Metadata = { title: "My Orders", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface Row { order_id: string; plan: string; amount_usd: number; coin: string; network: string; order_status: string; tx_hash: string | null; expires_at: string | null; created_at: string; reject_reason: string | null }
const PILL: Record<OrderView, string> = {
  awaiting_payment: "bg-amber-400 text-bg", under_review: "bg-accent/15 text-accent", approved: "bg-accent text-bg",
  rejected: "bg-red-500/80 text-white", expired: "bg-red-500/80 text-white", refunded: "bg-line text-muted",
};
const dmy = (iso: string) => iso.slice(0, 10).split("-").reverse().join("-");

export default async function Page() {
  const { data } = await (await supabaseServer()).from("orders")
    .select("order_id,plan,amount_usd,coin,network,order_status,tx_hash,expires_at,created_at,reject_reason").order("created_at", { ascending: false });
  const rows = (data ?? []) as Row[];
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold tracking-tight">My Orders</h1><p className="mt-1 text-sm text-muted">Your payments and their status.</p></div>
        <Link href="/pricing" className="btn btn-primary !py-2.5">New order</Link>
      </div>
      <div className="mt-6">
        {rows.length === 0 ? <Empty title="No orders yet" text="Orders placed with the email you are signed in with will appear here." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm">
              <thead><tr className="text-xs text-muted">{["Order", "Plan", "Amount", "Method", "Date", "Status", ""].map((h) => <th key={h} scope="col" className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {rows.map((r) => {
                  const s = deriveStatus(r);
                  return (
                    <tr key={r.order_id} className="bg-bg">
                      <td className="rounded-l-xl px-4 py-3.5 font-mono text-xs">{r.order_id}</td>
                      <td className="px-4 py-3.5 capitalize">{r.plan}</td><td className="px-4 py-3.5">${r.amount_usd}</td>
                      <td className="px-4 py-3.5">{r.coin} · {r.network}</td><td className="px-4 py-3.5">{dmy(r.created_at)}</td>
                      <td className="px-4 py-3.5"><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${PILL[s]}`}>{ORDER_VIEW_LABEL[s]}</span>
                        {s === "rejected" && r.reject_reason && <span className="mt-1 block text-xs text-muted">{r.reject_reason}</span>}</td>
                      <td className="rounded-r-xl px-4 py-3.5 text-right">
                        {s === "approved" ? <Link className="text-accent underline" href="/dashboard/license">View license</Link>
                          : s === "refunded" ? null : <Link className="text-accent underline" href={`/checkout?order=${r.order_id}`}>{s === "under_review" ? "View" : "Continue"}</Link>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
