import Link from "next/link";
import { Ico, Meter, daysLeft, type LicenseView } from "@/components/dashboard/ui";
import { LicenseCard } from "@/components/dashboard/LicenseCard";

/** Premium card per license. Shows the essentials; "View details" opens the full page. */
export function LicenseCards({ licenses }: { licenses: LicenseView[] }) {
  if (licenses.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-8 text-center">
        <p className="font-display text-lg font-semibold">No licenses yet</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">Choose a plan to get your first license. It appears here as soon as your payment is confirmed.</p>
        <Link href="/dashboard/renew" className="mt-4 inline-flex min-h-[46px] items-center rounded-full bg-accent px-6 text-sm font-semibold text-bg active:brightness-95">Buy a license</Link>
      </div>
    );
  }
  const order = { active: 0, suspended: 1, expired: 2, revoked: 3 } as const;
  const list = [...licenses].sort((a, b) => order[a.state] - order[b.state]);
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {list.map((l) => {
        const lifetime = l.plan === "lifetime";
        const d = lifetime ? null : daysLeft(l.expiration_date);
        return (
          <li key={l.id} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-bg2/70 p-3 shadow-lg shadow-black/20">
            <LicenseCard l={l} />
            <div className="space-y-3 px-1.5 pb-1 pt-4">
              <Meter days={d} lifetime={lifetime} />
              <div className="flex gap-2">
                <Link href={`/dashboard/license/${l.id}`} className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-semibold text-bg active:brightness-95">View details<Ico name="arrow" size={16} /></Link>
                {!lifetime && l.state !== "revoked" && <Link href={`/dashboard/renew?license=${l.id}`} className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40">Renew</Link>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
