import Link from "next/link";
import { CryptoCheckout } from "@/components/checkout/CryptoCheckout";
import { Empty } from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth";
import { isPlanId } from "@/lib/config/pricing";
import { myLicenses } from "@/lib/db/customer";
import { StatusPill, daysLeft } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";
const dmy = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("-") : "—");

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; license?: string }> }) {
  const user = await requireUser();
  const { plan, license } = await searchParams;
  const all = await myLicenses();

  // Renewing one specific license
  if (license) {
    const l = all.find((x) => x.id === license);
    if (!l) return <Empty title="License not found" text="That license is not on your account. Open My License and pick the one you want to renew." />;
    if (l.plan !== "monthly") return <Empty title="Nothing to renew" text="Lifetime licenses never expire." />;
    if (l.status === "revoked") return <Empty title="This license was revoked" text="Please contact support if you think this is a mistake." />;
    return (
      <>
        <Link href="/dashboard/license" className="text-sm text-accent">‹ My License</Link>
        <h1 className="mb-1 mt-3 font-display text-2xl font-bold sm:text-3xl">Renew license</h1>
        <p className="mb-6 text-sm text-muted">Choose how many months to add. Your key and MT5 account stay the same license.</p>
        <CryptoCheckout dashboard accountEmail={user.email ?? ""} initialPlan="monthly" renew={{ id: l.id, ref: l.license_ref, expires: l.expiration_date }} />
      </>
    );
  }

  const monthly = all.filter((l) => l.plan === "monthly" && l.status !== "revoked");
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-bold sm:text-3xl">Renew / Buy</h1>
      <p className="mb-6 text-sm text-muted">Extend a license you already have, or buy a new one for another MT5 account.</p>

      {monthly.length > 0 && (
        <section aria-label="Renew a license" className="mb-8">
          <h2 className="mb-3 font-display text-lg font-semibold">Renew a license</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {monthly.map((l) => (
              <li key={l.id} className="rounded-2xl border border-line bg-bg p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-sm">{l.license_ref}</p>
                  <StatusPill state={l.state} />
                </div>
                <p className="mt-1 text-sm text-muted">Expires {dmy(l.expiration_date)}{daysLeft(l.expiration_date) !== null && (daysLeft(l.expiration_date) as number) > 0 ? ` (${daysLeft(l.expiration_date)} days left)` : ""}{l.mt5_account ? ` · MT5 ${l.mt5_account}` : ""}</p>
                <Link href={`/dashboard/renew?license=${l.id}`} className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-accent text-sm font-semibold text-bg active:brightness-95">Renew this license</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mb-3 font-display text-lg font-semibold">Buy a new license</h2>
      <CryptoCheckout dashboard accountEmail={user.email ?? ""} initialPlan={isPlanId(plan) ? plan : "monthly"} />
    </>
  );
}
