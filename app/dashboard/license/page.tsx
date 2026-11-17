import { Empty } from "@/components/dashboard/DashboardShell";
import { RevealKey } from "@/components/dashboard/RevealKey";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";
const fmt = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

export default async function Page() {
  const lics = await myLicenses();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">My License</h1>
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
              <RevealKey licenseId={l.id} />
              <p className="mt-3 text-xs text-muted">Keep your key private. The first MT5 account that activates it is locked to it. Contact support to change accounts.</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
