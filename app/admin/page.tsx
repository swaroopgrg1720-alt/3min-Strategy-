import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState, type LicenseRow } from "@/lib/licensing/service";
import {
  confirmOrderAction, createLicenseAction, extendLicenseAction, publishProductAction,
  resetAccountAction, setLicenseStatusAction, setTicketStatusAction, syncOrderAction,
} from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Admin list rows never include the key hash or ciphertext. */
type AdminLicense = Omit<LicenseRow, "key_hash" | "key_ciphertext">;

const fmt = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") : "—");
const th = "py-2 pr-4 text-xs font-medium uppercase tracking-wider text-muted";
const td = "py-2 pr-4 align-top";
const inp = "rounded-lg border border-line bg-bg px-3 py-2 text-sm";
const mini = "rounded-lg border border-line px-2.5 py-1 text-xs hover:border-accent/50";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card overflow-x-auto" aria-label={title}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: actionError } = await searchParams;
  const admin = await requireAdmin();
  const db = supabaseAdmin();
  const [orders, lics, products, tickets] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("licenses").select("id,license_ref,customer_email,plan,expiration_date,status,mt5_account,activation_status,key_prefix,created_at,start_date").order("created_at", { ascending: false }).limit(200),
    db.from("products").select("*").order("created_at", { ascending: false }).limit(20),
    db.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  const dbError = orders.error?.message || lics.error?.message;
  const licenses = (lics.data ?? []) as unknown as AdminLicense[];
  const customers = Array.from(new Set(licenses.map((l) => l.customer_email)));

  return (
    <div className="container-x space-y-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Admin</h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>Signed in as {admin.email}</span>
          <form action="/auth/signout" method="post"><button className="btn btn-ghost !py-1.5 !text-xs">Sign out</button></form>
        </div>
      </div>

      {dbError && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">
          Database problem: {dbError}. If it mentions a missing table, run supabase/migrations/001_init.sql in the Supabase SQL Editor.
        </p>
      )}
      {actionError && (
        <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">
          Action failed: {actionError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Orders", orders.data?.length ?? 0], ["Customers", customers.length], ["Licenses", licenses.length], ["Active", licenses.filter((l) => licenseState(l) === "active").length]].map(([k, v]) => (
          <div key={k as string} className="card"><p className="text-xs uppercase tracking-wider text-muted">{k}</p><p className="mt-2 text-2xl font-bold">{v}</p></div>
        ))}
      </div>

      <Section title="Orders">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead><tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Plan</th><th className={th}>Amount</th><th className={th}>Payment</th><th className={th}>Date</th><th className={th}></th></tr></thead>
          <tbody>
            {(orders.data ?? []).length === 0 && <tr><td colSpan={7} className="py-6 text-muted">No orders yet.</td></tr>}
            {(orders.data ?? []).map((o) => (
              <tr key={o.order_id} className="border-t border-line">
                <td className={`${td} font-mono text-xs`}>{o.order_id}</td><td className={td}>{o.customer_email}</td><td className={td}>{o.plan}</td>
                <td className={td}>${o.amount_usd} {o.coin}</td><td className={td}>{o.payment_status}</td><td className={td}>{fmt(o.created_at)}</td>
                <td className={td}>
                  {o.order_status !== "confirmed" && o.order_status !== "refunded" && (
                    <div className="flex flex-wrap gap-2">
                    {o.provider_ref && <form action={syncOrderAction}><input type="hidden" name="orderId" value={o.order_id} /><button className={mini}>Check with CryptoPayr</button></form>}
                    <form action={confirmOrderAction}><input type="hidden" name="orderId" value={o.order_id} />
                      <button className={mini} title="Only after verifying the payment on-chain">Confirm paid &amp; issue license</button></form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="Licenses">
        <form action={createLicenseAction} className="mb-6 flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">Customer email<input name="email" type="email" required className={`${inp} mt-1 block`} /></label>
          <label className="text-xs text-muted">Plan<select name="plan" className={`${inp} mt-1 block`}><option value="monthly">Monthly (30 days)</option><option value="lifetime">Lifetime</option></select></label>
          <button className="btn btn-primary !py-2">Create license</button>
        </form>
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr><th className={th}>License</th><th className={th}>Customer</th><th className={th}>Plan</th><th className={th}>Expires</th><th className={th}>State</th><th className={th}>MT5 account</th><th className={th}>Actions</th></tr></thead>
          <tbody>
            {licenses.length === 0 && <tr><td colSpan={7} className="py-6 text-muted">No licenses yet.</td></tr>}
            {licenses.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className={`${td} font-mono text-xs`}>{l.license_ref}</td><td className={td}>{l.customer_email}</td><td className={td}>{l.plan}</td>
                <td className={td}>{l.plan === "lifetime" ? "Lifetime" : fmt(l.expiration_date)}</td><td className={td}>{licenseState(l)}</td>
                <td className={`${td} font-mono text-xs`}>{l.mt5_account ?? "—"}</td>
                <td className={`${td} flex flex-wrap gap-2`}>
                  {l.status === "active"
                    ? <form action={setLicenseStatusAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="suspended" /><button className={mini}>Suspend</button></form>
                    : <form action={setLicenseStatusAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="active" /><button className={mini}>Reactivate</button></form>}
                  {l.status !== "revoked" && <form action={setLicenseStatusAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="status" value="revoked" /><button className={mini}>Revoke</button></form>}
                  {l.plan === "monthly" && <form action={extendLicenseAction}><input type="hidden" name="id" value={l.id} /><input type="hidden" name="days" value="30" /><button className={mini}>+30 days</button></form>}
                  {l.mt5_account && <form action={resetAccountAction}><input type="hidden" name="id" value={l.id} /><button className={mini}>Unbind account</button></form>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-muted">Keys are stored hashed + encrypted. Customers see their own key in their dashboard.</p>
      </Section>

      <Section title="Customers">
        {customers.length === 0 ? <p className="text-sm text-muted">No customers yet.</p> : (
          <ul className="grid gap-1 text-sm sm:grid-cols-2">{customers.map((c) => <li key={c}>{c} <span className="text-muted">· {licenses.filter((l) => l.customer_email === c).length} license(s)</span></li>)}</ul>
        )}
      </Section>

      <Section title="Products (EX5 downloads)">
        <p className="mb-4 text-sm text-muted">1) Upload the EX5 to the PRIVATE Supabase Storage bucket <code>ea-files</code>. 2) Enter its path and version here.</p>
        <form action={publishProductAction} className="mb-6 flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">Version<input name="version" required placeholder="1.0.0" className={`${inp} mt-1 block`} /></label>
          <label className="text-xs text-muted">File path in bucket<input name="path" required placeholder="3MIN_SCALP_v1.0.0.ex5" className={`${inp} mt-1 block`} /></label>
          <label className="text-xs text-muted">Notes<input name="notes" className={`${inp} mt-1 block`} /></label>
          <button className="btn btn-primary !py-2">Publish as current</button>
        </form>
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead><tr><th className={th}>Version</th><th className={th}>File</th><th className={th}>Current</th><th className={th}>Date</th></tr></thead>
          <tbody>{(products.data ?? []).map((p) => <tr key={p.id} className="border-t border-line"><td className={td}>{p.version}</td><td className={`${td} font-mono text-xs`}>{p.storage_path}</td><td className={td}>{p.is_current ? "Yes" : ""}</td><td className={td}>{fmt(p.created_at)}</td></tr>)}</tbody>
        </table>
      </Section>

      <Section title="Support tickets">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead><tr><th className={th}>Customer</th><th className={th}>Subject</th><th className={th}>Message</th><th className={th}>Status</th><th className={th}></th></tr></thead>
          <tbody>
            {(tickets.data ?? []).length === 0 && <tr><td colSpan={5} className="py-6 text-muted">No tickets.</td></tr>}
            {(tickets.data ?? []).map((t) => (
              <tr key={t.id} className="border-t border-line">
                <td className={td}>{t.customer_email}</td><td className={td}>{t.subject}</td><td className={`${td} max-w-xs whitespace-pre-wrap text-muted`}>{t.message}</td><td className={td}>{t.status}</td>
                <td className={td}><form action={setTicketStatusAction} className="flex gap-2"><input type="hidden" name="id" value={t.id} /><input type="hidden" name="status" value={t.status === "closed" ? "open" : "closed"} /><button className={mini}>{t.status === "closed" ? "Reopen" : "Close"}</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
