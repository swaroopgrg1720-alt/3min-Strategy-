import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
import { RevealKey } from "@/components/dashboard/RevealKey";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";
const fmt = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

export default async function Page() {
  const lics = await myLicenses();
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">My License</h1><Link href="/dashboard/renew" className="btn btn-ghost !py-2">Renew / Buy</Link></div>
      {lics.length === 0 ? (
        <Empty title="No license found" text="Once your payment is confirmed your license appears here. Make sure you signed in with the email you purchased with." />
      ) : (
        <div className="space-y-4">
          {lics.map((l) => (
            <div key={l.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-mono text-sm">{l.license_ref}</h2>
                <span className="rounded-md border border-line px-2 py-0.5 text-xs uppercase tracking-wider text-accent">{l.state}</span>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                <div><dt className="text-muted">Plan</dt><dd>{l.plan}</dd></div>
                <div><dt className="text-muted">Expires</dt><dd>{l.plan === "lifetime" ? "Lifetime" : fmt(l.expiration_date)}</dd></div>
                <div><dt className="text-muted">MT5 account</dt><dd>{l.mt5_account ?? "Not activated yet"}</dd></div>
              </dl>
              {l.plan === "monthly" && l.state !== "revoked" && (
                <Link href={`/dashboard/renew?license=${l.id}`} className="btn btn-primary mt-4 w-full sm:w-auto">Renew this license</Link>
              )}
              <RevealKey licenseId={l.id} boundAccount={l.mt5_account} />
              <p className="mt-3 text-xs text-muted">Keep your key private. It works only on the MT5 account number above. For monthly licenses the key changes after each renewal, so come back here and copy the new one. Contact support to change accounts.</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
