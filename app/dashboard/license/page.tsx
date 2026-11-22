import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
import { RevealKey } from "@/components/dashboard/RevealKey";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { Ico, Meter, PageHeader, StatusPill, daysLeft, dmy } from "@/components/dashboard/ui";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const lics = await myLicenses();
  return (
    <>
      <PageHeader title="My License" text="Your license details and EA key.">
        <Link href="/dashboard/renew" className="inline-flex min-h-[46px] items-center rounded-full border border-line px-5 text-sm font-semibold text-ink active:bg-forest/40">Renew / Buy</Link>
      </PageHeader>
      {lics.length === 0 ? (
        <Empty title="No license found" text="Once your payment is confirmed your license appears here. Make sure you signed in with the email you purchased with." />
      ) : (
        <div className="space-y-5">
          {lics.map((l) => {
            const d = l.plan === "monthly" ? daysLeft(l.expiration_date) : null;
            const canUse = l.state === "active";
            return (
              <article key={l.id} className="overflow-hidden rounded-2xl border border-line bg-bg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-bg2/60 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest/60 text-accent"><Ico name="key" /></span>
                    <div className="min-w-0">
                      <p className="text-xs text-muted">License ID</p>
                      <p className="flex items-center gap-2"><span className="truncate font-mono text-sm text-ink">{l.license_ref}</span>
                        <CopyButton value={l.license_ref} className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium text-muted active:bg-forest/40" /></p>
                    </div>
                  </div>
                  <StatusPill state={l.state} />
                </div>

                <div className="space-y-5 p-5">
                  <dl className="grid gap-4 text-sm sm:grid-cols-4">
                    <div><dt className="text-xs text-muted">Plan</dt><dd className="mt-0.5 font-semibold capitalize">{l.plan}</dd></div>
                    <div><dt className="text-xs text-muted">Started</dt><dd className="mt-0.5 font-semibold">{dmy(l.start_date)}</dd></div>
                    <div><dt className="text-xs text-muted">{l.plan === "lifetime" ? "Access" : "Expires"}</dt><dd className="mt-0.5 font-semibold">{l.plan === "lifetime" ? "Lifetime" : dmy(l.expiration_date)}</dd></div>
                    <div><dt className="text-xs text-muted">MT5 account</dt><dd className="mt-0.5 font-mono font-semibold">{l.mt5_account ?? "Not set yet"}</dd></div>
                  </dl>

                  <Meter days={d} lifetime={l.plan === "lifetime"} />

                  {l.plan === "monthly" && l.state !== "revoked" && (
                    <Link href={`/dashboard/renew?license=${l.id}`} className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-bg active:brightness-95 sm:w-auto">Renew this license</Link>
                  )}

                  {canUse ? <RevealKey licenseId={l.id} boundAccount={l.mt5_account} /> : (
                    <p className="rounded-xl border border-line bg-bg2/60 p-4 text-sm text-muted">The key is hidden while this license is {l.state}.{l.state === "expired" ? " Renew it to get a working key." : " Contact support if you think this is a mistake."}</p>
                  )}

                  <ul className="space-y-1.5 text-xs leading-relaxed text-muted">
                    <li>Keep your key private. It works only on the MT5 account shown above.</li>
                    {l.plan === "monthly" && <li>The key changes after each renewal. Come back here and copy the new one.</li>}
                    <li>To use a different MT5 account, contact support.</li>
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
