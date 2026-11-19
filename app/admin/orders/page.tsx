import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Chips, EmptyState, FlashBanner, OrderBadge, PageHead, SearchBox, backTo, fmtDateTime, smallBtn, smallPrimary, type AdminSearch } from "@/components/admin/ui";
import { confirmOrderAction, deleteOrderAction, syncOrderAction } from "../actions";

export const metadata: Metadata = { title: "Orders | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const GROUPS: Record<string, (s: string) => boolean> = {
  all: () => true,
  review: (s) => s === "payment_detected",
  awaiting: (s) => s === "pending",
  paid: (s) => s === "confirmed",
  closed: (s) => ["expired", "failed", "refunded"].includes(s),
};

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const { data, error } = await supabaseAdmin().from("orders").select("*").order("created_at", { ascending: false }).limit(500);
  const all = data ?? [];
  const status = sp.status && GROUPS[sp.status] ? sp.status : "all";
  const q = (sp.q ?? "").trim().toLowerCase();
  const rows = all.filter((o) => GROUPS[status](o.order_status) && (!q || o.customer_email.toLowerCase().includes(q) || o.order_id.toLowerCase().includes(q)));
  const count = (k: string) => all.filter((o) => GROUPS[k](o.order_status)).length;
  const back = backTo("/admin/orders", { status: status === "all" ? undefined : status, q: q || undefined });

  return (
    <>
      <PageHead title="Orders" text="Payments start here. A paid order creates the customer's license automatically." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error ?? error?.message} />
      <SearchBox action="/admin/orders" q={sp.q} placeholder="Search email or order ID" keep={{ status: status === "all" ? undefined : status }} />
      <Chips base="/admin/orders" param="status" active={status} keep={{ q: q || undefined }} options={[
        { value: "all", label: "All", count: all.length }, { value: "review", label: "Needs review", count: count("review") }, { value: "awaiting", label: "Awaiting payment", count: count("awaiting") },
        { value: "paid", label: "Paid", count: count("paid") }, { value: "closed", label: "Closed", count: count("closed") },
      ]} />
      {rows.length === 0 ? <EmptyState title="No orders here" text="Try another filter, or wait for the first checkout." /> : (
        <ul className="space-y-3">
          {rows.map((o) => {
            const open = o.order_status !== "confirmed" && o.order_status !== "refunded";
            return (
              <li key={o.order_id} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0"><p className="truncate font-medium">{o.customer_email}</p><p className="font-mono text-xs text-muted">{o.order_id}</p></div>
                  <OrderBadge status={o.order_status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-muted">Plan</dt><dd>{o.plan}{o.months > 1 ? ` × ${o.months} months` : ""}</dd></div>
                  <div><dt className="text-muted">Amount</dt><dd className="font-semibold">${o.amount_usd}</dd></div>
                  <div><dt className="text-muted">Created</dt><dd>{fmtDateTime(o.created_at)}</dd></div>
                  <div><dt className="text-muted">Paid</dt><dd>{fmtDateTime(o.confirmed_at)}</dd></div>
                </dl>
                {open && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.provider_ref && (
                      <form action={syncOrderAction}><input type="hidden" name="orderId" value={o.order_id} /><input type="hidden" name="back" value={back} />
                        <SubmitButton className={smallPrimary}>Check with CryptoPayr</SubmitButton></form>
                    )}
                    <form action={confirmOrderAction}><input type="hidden" name="orderId" value={o.order_id} /><input type="hidden" name="back" value={back} />
                      <SubmitButton className={smallBtn} confirm="Mark this order as paid and issue the license? Only do this after you have seen the payment arrive.">Confirm paid</SubmitButton></form>
                    {["pending", "failed", "expired"].includes(o.order_status) && (
                      <form action={deleteOrderAction}><input type="hidden" name="orderId" value={o.order_id} /><input type="hidden" name="back" value={back} />
                        <SubmitButton className={`${smallBtn} !text-red-300`} confirm="Delete this unpaid order?">Delete</SubmitButton></form>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
