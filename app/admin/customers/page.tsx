import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState } from "@/lib/licensing/service";
import { Badge, EmptyState, FlashBanner, PageHead, SearchBox, fmtDate, licenseTone, type AdminSearch } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Customers | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const db = supabaseAdmin();
  const [lics, orders] = await Promise.all([
    db.from("licenses").select("customer_email,plan,status,expiration_date,mt5_account,created_at").limit(2000),
    db.from("orders").select("customer_email,amount_usd,order_status,created_at").order("created_at", { ascending: false }).limit(2000),
  ]);
  type C = { email: string; licenses: NonNullable<typeof lics.data>; orders: NonNullable<typeof orders.data> };
  const map = new Map<string, C>();
  const get = (e: string) => { const k = e.toLowerCase(); if (!map.has(k)) map.set(k, { email: k, licenses: [], orders: [] }); return map.get(k)!; };
  (lics.data ?? []).forEach((l) => get(l.customer_email).licenses.push(l));
  (orders.data ?? []).forEach((o) => get(o.customer_email).orders.push(o));
  const q = (sp.q ?? "").trim().toLowerCase();
  const list = Array.from(map.values()).filter((c) => !q || c.email.includes(q)).sort((a, b) => (b.orders[0]?.created_at ?? "").localeCompare(a.orders[0]?.created_at ?? ""));

  return (
    <>
      <PageHead title="Customers" text="Everyone who has a license or started a checkout." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error} />
      <SearchBox action="/admin/customers" q={sp.q} placeholder="Search by email" />
      {list.length === 0 ? <EmptyState title="No customers yet" text="They appear here after their first checkout." /> : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {list.map((c) => {
            const paid = c.orders.filter((o) => o.order_status === "confirmed");
            const total = paid.reduce((s, o) => s + Number(o.amount_usd || 0), 0);
            const best = c.licenses.map((l) => licenseState(l)).sort((a, b) => (a === "active" ? -1 : b === "active" ? 1 : 0))[0];
            return (
              <li key={c.email} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 break-all font-medium">{c.email}</p>
                  {best ? <Badge tone={licenseTone(best)}>{best[0].toUpperCase() + best.slice(1)}</Badge> : <Badge>No license</Badge>}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-muted">Licenses</dt><dd>{c.licenses.length}</dd></div>
                  <div><dt className="text-muted">Orders</dt><dd>{c.orders.length}</dd></div>
                  <div><dt className="text-muted">Paid</dt><dd className="font-semibold text-accent">${total.toFixed(2)}</dd></div>
                  <div className="col-span-3"><dt className="text-muted">Last order</dt><dd>{fmtDate(c.orders[0]?.created_at)}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link className="btn btn-ghost !min-h-[40px] !px-4 !py-2 !text-sm" href={`/admin/licenses?q=${encodeURIComponent(c.email)}`}>Licenses</Link>
                  <Link className="btn btn-ghost !min-h-[40px] !px-4 !py-2 !text-sm" href={`/admin/orders?q=${encodeURIComponent(c.email)}`}>Orders</Link>
                  <a className="btn btn-ghost !min-h-[40px] !px-4 !py-2 !text-sm" href={`mailto:${c.email}`}>Email</a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
