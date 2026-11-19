import Link from "next/link";
import { myLicenses } from "@/lib/db/customer";
import { LicenseTable, type LicenseView } from "@/components/dashboard/LicenseTable";

export const dynamic = "force-dynamic";
const dmy = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("-") : "—");

export default async function Page() {
  const all = await myLicenses();
  const views: LicenseView[] = all.map((l) => ({
    id: l.id, license_ref: l.license_ref, plan: l.plan, start_date: l.start_date,
    expiration_date: l.expiration_date, mt5_account: l.mt5_account, state: l.state,
  }));
  const active = all.filter((l) => l.state === "active");
  const next = active.filter((l) => l.plan === "monthly" && l.expiration_date).map((l) => l.expiration_date as string).sort()[0];
  const hasLifetime = active.some((l) => l.plan === "lifetime");
  const account = all.find((l) => l.mt5_account)?.mt5_account ?? null;

  const cards: [string, string][] = [
    ["Active licenses", String(active.length)],
    ["Next expiry", hasLifetime && !next ? "Lifetime" : dmy(next ?? null)],
    ["MT5 account", account ?? "Not set"],
    ["Product", "3MIN SCALP"],
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Your licenses, downloads and trading tools.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/downloads" className="btn btn-ghost !py-2.5">Download EA</Link>
          <Link href="/documentation" className="btn btn-ghost !py-2.5">Installation Guide</Link>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-line bg-bg p-4">
            <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-1.5 truncate text-lg font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8"><LicenseTable licenses={views} /></div>

      {all.length === 0 && (
        <p className="mt-6 text-sm text-muted">Signed in with a different email than your purchase? Use the same email you ordered with, or <Link className="text-accent underline" href="/contact">contact support</Link>.</p>
      )}
    </>
  );
}
