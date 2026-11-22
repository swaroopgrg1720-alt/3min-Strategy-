import Link from "next/link";
import { Ico, Meter, StatusPill, daysLeft, dmy, type LicenseView } from "@/components/dashboard/ui";
import { LogoMark } from "@/components/ui/Logo";

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
          <li key={l.id} className="flex flex-col overflow-hidden rounded-3xl border border-line bg-bg shadow-lg shadow-black/20">
            <div className="relative overflow-hidden bg-gradient-to-br from-forest via-[#14261D] to-bg2 p-4">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-accent/10" aria-hidden="true" />
              <div className="relative flex items-center justify-between gap-2">
                <span className="flex items-center gap-2"><LogoMark size={26} /><span className="text-[12px] font-bold tracking-[0.14em]">3MIN <span className="text-accent">SCALP</span></span></span>
                <StatusPill state={l.state} />
              </div>
              <p className="relative mt-5 font-display text-2xl font-bold capitalize tracking-tight">{l.plan}</p>
              <p className="relative mt-0.5 truncate font-mono text-xs text-ink/70">{l.license_ref}</p>
            </div>

            <div className="flex-1 space-y-4 p-4">
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg2/60 p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted"><span className="text-accent"><Ico name="chip" size={15} /></span>MT5 account</dt>
                  <dd className={`mt-1 truncate font-mono text-[15px] font-semibold ${l.mt5_account ? "" : "text-amber-300"}`}>{l.mt5_account ?? "Not set"}</dd>
                </div>
                <div className="rounded-xl bg-bg2/60 p-3">
                  <dt className="flex items-center gap-1.5 text-xs text-muted"><span className="text-accent"><Ico name="clock" size={15} /></span>{lifetime ? "Access" : "Expires"}</dt>
                  <dd className="mt-1 truncate text-[15px] font-semibold">{lifetime ? "Lifetime" : dmy(l.expiration_date)}</dd>
                </div>
              </dl>
              <Meter days={d} lifetime={lifetime} />
            </div>

            <div className="flex gap-2 border-t border-line p-3">
              <Link href={`/dashboard/license/${l.id}`} className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-1.5 rounded-full bg-accent text-sm font-semibold text-bg active:brightness-95">View details<Ico name="arrow" size={16} /></Link>
              {!lifetime && l.state !== "revoked" && <Link href={`/dashboard/renew?license=${l.id}`} className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40">Renew</Link>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
