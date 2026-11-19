import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { licenseState, type LicenseRow } from "@/lib/licensing/service";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { LicenseActions } from "@/components/admin/LicenseActions";
import { Badge, Chips, EmptyState, FlashBanner, PageHead, SearchBox, backTo, field, fmtDate, licenseTone, relDays, type AdminSearch } from "@/components/admin/ui";
import { createLicenseAction } from "../actions";

export const metadata: Metadata = { title: "Licenses | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Admin list rows never include the key hash or ciphertext. */
type AdminLicense = Omit<LicenseRow, "key_hash" | "key_ciphertext"> & { activated_at?: string | null };

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const { data, error } = await supabaseAdmin()
    .from("licenses")
    .select("id,license_ref,customer_email,plan,expiration_date,status,mt5_account,activation_status,activated_at,start_date,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);
  const all = (data ?? []) as unknown as AdminLicense[];
  const state = ["active", "expired", "suspended", "revoked"].includes(sp.state ?? "") ? (sp.state as string) : "all";
  const q = (sp.q ?? "").trim().toLowerCase();
  const rows = all.filter((l) => (state === "all" || licenseState(l) === state) && (!q || l.customer_email.toLowerCase().includes(q) || l.license_ref.toLowerCase().includes(q) || (l.mt5_account ?? "").includes(q)));
  const count = (s: string) => all.filter((l) => licenseState(l) === s).length;
  const back = backTo("/admin/licenses", { state: state === "all" ? undefined : state, q: q || undefined });

  return (
    <>
      <PageHead title="Licenses" text="Tap ⋮ on a license to add days, change the expiry, suspend, unbind or delete it." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error ?? error?.message} />

      <details className="mb-4 rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
        <summary className="cursor-pointer list-none font-semibold text-accent">+ Create a license by hand</summary>
        <form action={createLicenseAction} className="mt-4 grid gap-3 sm:grid-cols-[1.4fr_1fr_0.7fr_auto] sm:items-end">
          <input type="hidden" name="back" value={back} />
          <label className="text-sm text-muted">Customer email<input name="email" type="email" required className={`${field} mt-1`} /></label>
          <label className="text-sm text-muted">Plan<select name="plan" className={`${field} mt-1`}><option value="monthly">Monthly</option><option value="lifetime">Lifetime</option></select></label>
          <label className="text-sm text-muted">Days (monthly)<input name="days" inputMode="numeric" defaultValue="30" className={`${field} mt-1`} /></label>
          <SubmitButton className="btn btn-primary">Create</SubmitButton>
        </form>
        <p className="mt-3 text-xs text-muted">For gifts, support or a payment you confirmed yourself. The customer sees the key after signing in with that email.</p>
      </details>

      <SearchBox action="/admin/licenses" q={sp.q} placeholder="Search email, license or MT5 account" keep={{ state: state === "all" ? undefined : state }} />
      <Chips base="/admin/licenses" param="state" active={state} keep={{ q: q || undefined }} options={[
        { value: "all", label: "All", count: all.length }, { value: "active", label: "Active", count: count("active") }, { value: "expired", label: "Expired", count: count("expired") },
        { value: "suspended", label: "Suspended", count: count("suspended") }, { value: "revoked", label: "Revoked", count: count("revoked") },
      ]} />

      {rows.length === 0 ? <EmptyState title="No licenses here" text="Paid orders create licenses automatically. You can also create one by hand above." /> : (
        <ul className="space-y-3">
          {rows.map((l) => {
            const s = licenseState(l);
            return (
              <li key={l.id} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-sm">{l.license_ref}</p><Badge tone={licenseTone(s)}>{s[0].toUpperCase() + s.slice(1)}</Badge></div>
                    <p className="mt-1 truncate text-sm text-muted">{l.customer_email}</p>
                  </div>
                  <LicenseActions back={back} resetKey={sp.t}
                    license={{ id: l.id, ref: l.license_ref, email: l.customer_email, plan: l.plan, status: l.status, mt5: l.mt5_account, expires: l.expiration_date }} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-muted">Plan</dt><dd className="capitalize">{l.plan}</dd></div>
                  <div><dt className="text-muted">Expires</dt><dd>{l.plan === "lifetime" ? "Never" : <>{fmtDate(l.expiration_date)}<span className="block text-xs text-muted">{relDays(l.expiration_date)}</span></>}</dd></div>
                  <div><dt className="text-muted">MT5 account</dt><dd className="font-mono">{l.mt5_account ?? "Not activated"}</dd></div>
                  <div><dt className="text-muted">Created</dt><dd>{fmtDate(l.start_date)}</dd></div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted">Keys are stored hashed and encrypted. Customers see their own key in their dashboard.</p>
    </>
  );
}
