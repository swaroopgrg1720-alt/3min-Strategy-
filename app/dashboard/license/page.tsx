import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
import { RevealKey } from "@/components/dashboard/RevealKey";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { Ico, PageHeader, Ring, StatusPill, daysLeft, dmy, type IconName } from "@/components/dashboard/ui";
import { LogoMark } from "@/components/ui/Logo";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const lics = await myLicenses();
  const order = { active: 0, suspended: 1, expired: 2, revoked: 3 } as const;
  const list = [...lics].sort((a, b) => order[a.state] - order[b.state]);
  return (
    <>
      <PageHeader title="My License" text="Your license pass and EA key.">
        <Link href="/dashboard/renew" className="inline-flex min-h-[46px] items-center rounded-full border border-line px-5 text-sm font-semibold text-ink active:bg-forest/40">Renew / Buy</Link>
      </PageHeader>
      {list.length === 0 ? (
        <Empty title="No license found" text="Once your payment is confirmed your license appears here. Make sure you signed in with the email you purchased with." />
      ) : (
        <div className="space-y-6">
          {list.map((l) => {
            const lifetime = l.plan === "lifetime";
            const d = lifetime ? null : daysLeft(l.expiration_date);
            const facts: { icon: IconName; label: string; value: string; mono?: boolean }[] = [
              { icon: "clock", label: lifetime ? "Access" : "Valid until", value: lifetime ? "Forever" : dmy(l.expiration_date) },
              { icon: "chip", label: "MT5 account", value: l.mt5_account ?? "Not set yet", mono: true },
              { icon: "renew", label: "Started", value: dmy(l.start_date) },
            ];
            return (
              <article key={l.id} className="overflow-hidden rounded-3xl border border-line bg-bg shadow-lg shadow-black/20">
                <div className="relative overflow-hidden bg-gradient-to-br from-forest via-[#14261D] to-bg2 p-5 sm:p-6">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-accent/10" aria-hidden="true" />
                  <div className="pointer-events-none absolute -right-2 top-6 h-28 w-28 rounded-full border border-accent/10" aria-hidden="true" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5"><LogoMark size={34} /><span className="text-[13px] font-bold tracking-[0.14em]">3MIN <span className="text-accent">SCALP</span></span></div>
                    <StatusPill state={l.state} />
                  </div>
                  <div className="relative mt-6 flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-ink/60">{lifetime ? "Lifetime license" : "Monthly license"}</p>
                      <h2 className="font-display text-3xl font-bold capitalize tracking-tight sm:text-4xl">{l.plan}</h2>
                      <p className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="break-all font-mono text-[13px] text-ink/80">{l.license_ref}</span>
                        <CopyButton value={l.license_ref} label="Copy ID" className="rounded-full border border-ink/20 px-2.5 py-0.5 text-xs font-medium text-ink/70 active:bg-black/20" />
                      </p>
                    </div>
                    <Ring days={d} lifetime={lifetime} />
                  </div>
                </div>

                <dl className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  {facts.map((f) => (
                    <div key={f.label} className="flex items-center gap-3 px-5 py-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/50 text-accent"><Ico name={f.icon} /></span>
                      <div className="min-w-0"><dt className="text-xs text-muted">{f.label}</dt><dd className={`truncate text-[15px] font-semibold ${f.mono ? "font-mono" : ""}`}>{f.value}</dd></div>
                    </div>
                  ))}
                </dl>

                <div className="p-5 sm:p-6">
                  <h3 className="font-display text-lg font-semibold">EA license key</h3>
                  <p className="mt-0.5 text-sm text-muted">{l.mt5_account ? "Paste this key into the EA inputs on your MT5 account." : "Enter your MT5 account number to create your key."}</p>
                  {l.state === "active" ? <RevealKey licenseId={l.id} boundAccount={l.mt5_account} /> : (
                    <p className="mt-4 rounded-xl border border-line bg-bg2/60 p-4 text-sm text-muted">The key is hidden while this license is {l.state}.{l.state === "expired" ? " Renew it to get a working key." : " Contact support if you think this is a mistake."}</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    {!lifetime && l.state !== "revoked" && <Link href={`/dashboard/renew?license=${l.id}`} className="inline-flex min-h-[46px] flex-1 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-bg active:brightness-95 sm:flex-none">Renew this license</Link>}
                    {l.state === "active" && <Link href="/dashboard/downloads" className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full border border-line px-6 text-sm font-semibold active:bg-forest/40 sm:flex-none"><Ico name="download" size={18} />Download EA</Link>}
                  </div>

                  <ul className="mt-5 space-y-1.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
                    <li>Keep your key private. It works only on the MT5 account shown above.</li>
                    {!lifetime && <li>The key changes after each renewal. Come back here and copy the new one.</li>}
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
