import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState } from "@/lib/licensing/service";
import { site } from "@/lib/config/site";
import { Badge, EmptyState, FlashBanner, OrderBadge, PageHead, Stat, fmtDateTime, relDays, type AdminSearch } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const db = supabaseAdmin();
  const [orders, lics, tickets, product] = await Promise.all([
    db.from("orders").select("order_id,customer_email,plan,months,amount_usd,order_status,created_at").order("created_at", { ascending: false }).limit(500),
    db.from("licenses").select("id,license_ref,customer_email,plan,expiration_date,status").order("created_at", { ascending: false }).limit(1000),
    db.from("support_tickets").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("products").select("version,storage_path,created_at").eq("is_current", true).maybeSingle(),
  ]);
  const dbError = orders.error?.message || lics.error?.message;
  const o = orders.data ?? [];
  const l = lics.data ?? [];
  const now = Date.now();
  const paid = o.filter((x) => x.order_status === "confirmed");
  const revenue = paid.reduce((s, x) => s + Number(x.amount_usd || 0), 0);
  const active = l.filter((x) => licenseState(x) === "active");
  const expiring = l.filter((x) => x.plan === "monthly" && licenseState(x) === "active" && x.expiration_date && new Date(x.expiration_date).getTime() - now < 7 * 86_400_000);
  const review = o.filter((x) => x.order_status === "payment_detected");
  const awaiting = o.filter((x) => x.order_status === "pending");
  const customers = new Set([...l.map((x) => x.customer_email.toLowerCase()), ...o.map((x) => x.customer_email.toLowerCase())]).size;
  const openTickets = tickets.count ?? 0;

  const checks = [
    { ok: !dbError, label: "Database connected" },
    { ok: !!process.env.CRYPTO_PAYMENT_API_KEY, label: "CryptoPayr key set" },
    { ok: !/localhost|127\.0\.0\.1/.test(site.url), label: "Website address is not localhost" },
    { ok: !!process.env.EA_SECRET_SALT, label: "EA key salt set" },
    { ok: !!product.data, label: "EA file published for customers" },
  ];

  return (
    <>
      <PageHead title="Overview" text="Everything about your 3MIN SCALP business in one place." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error} />
      {dbError && <p role="alert" className="mb-5 rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">Database problem: {dbError}. If it mentions a missing table, run the SQL files from supabase/migrations in the Supabase SQL Editor.</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Revenue (paid orders)" value={`$${revenue.toFixed(2)}`} hint={`${paid.length} paid order${paid.length === 1 ? "" : "s"}`} tone="good" />
        <Stat label="Active licenses" value={active.length} hint={`${l.length} in total`} />
        <Stat label="Customers" value={customers} />
        <Stat label="Expiring in 7 days" value={expiring.length} tone={expiring.length ? "warn" : "neutral"} />
        <Stat label="Orders to check" value={review.length + awaiting.length} hint={`${review.length} need review`} tone={review.length ? "warn" : "neutral"} />
        <Stat label="Open tickets" value={openTickets} tone={openTickets ? "warn" : "neutral"} />
      </div>

      <section className="mt-6 rounded-3xl border border-line bg-bg2 p-5" aria-label="Needs attention">
        <h2 className="text-lg font-semibold">Needs your attention</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {review.length > 0 && <li><Link className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3 active:bg-forest/40" href="/admin/orders?status=review">Payments that need a manual check<Badge tone="warn">{review.length}</Badge></Link></li>}
          {expiring.length > 0 && <li><Link className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3 active:bg-forest/40" href="/admin/licenses?state=active">Monthly licenses ending within 7 days<Badge tone="warn">{expiring.length}</Badge></Link></li>}
          {openTickets > 0 && <li><Link className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3 active:bg-forest/40" href="/admin/support">Open support tickets<Badge tone="warn">{openTickets}</Badge></Link></li>}
          {!product.data && <li><Link className="flex items-center justify-between rounded-2xl border border-line bg-bg px-4 py-3 active:bg-forest/40" href="/admin/downloads">Publish your EA so customers can download it<Badge tone="warn">To do</Badge></Link></li>}
          {review.length + expiring.length + openTickets === 0 && product.data && <li className="text-muted">Nothing needs attention right now.</li>}
        </ul>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl border border-line bg-bg2 p-5" aria-label="Recent orders">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm text-accent">See all</Link></div>
          {o.length === 0 ? <div className="mt-3"><EmptyState title="No orders yet" text="Orders appear here as soon as someone starts a checkout." /></div> : (
            <ul className="mt-3 divide-y divide-line">
              {o.slice(0, 6).map((x) => (
                <li key={x.order_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{x.customer_email}</p><p className="text-xs text-muted">{x.plan}{x.months > 1 ? ` ×${x.months}` : ""} · ${x.amount_usd} · {fmtDateTime(x.created_at)}</p></div>
                  <OrderBadge status={x.order_status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-bg2 p-5" aria-label="Current EA">
            <h2 className="text-lg font-semibold">EA customers download</h2>
            {product.data ? (
              <p className="mt-2 text-sm text-muted">Version <span className="font-semibold text-ink">{product.data.version}</span> · <span className="font-mono text-xs">{product.data.storage_path}</span><br />Published {relDays(product.data.created_at)}</p>
            ) : <p className="mt-2 text-sm text-muted">Nothing published yet.</p>}
            <Link href="/admin/downloads" className="btn btn-ghost mt-4 w-full">Manage EA files</Link>
          </section>
          <section className="rounded-3xl border border-line bg-bg2 p-5" aria-label="Setup check">
            <h2 className="text-lg font-semibold">Setup check</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {checks.map((c) => <li key={c.label} className="flex items-center gap-2"><span className={c.ok ? "text-accent" : "text-amber-300"} aria-hidden="true">{c.ok ? "✓" : "!"}</span><span className={c.ok ? "" : "text-amber-200"}>{c.label}</span></li>)}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
