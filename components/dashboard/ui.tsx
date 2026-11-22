import type { ReactNode } from "react";
export type LicenseState = "active" | "expired" | "suspended" | "revoked";
export interface LicenseView {
  id: string; license_ref: string; plan: "monthly" | "lifetime"; start_date: string;
  expiration_date: string | null; mt5_account: string | null; state: LicenseState;
}
export const dt = (iso: string | null | undefined) => (iso ? `${iso.slice(0, 10).split("-").reverse().join("-")} ${iso.slice(11, 16)} UTC` : "—");

export const dmy = (iso: string | null | undefined) => (iso ? iso.slice(0, 10).split("-").reverse().join("-") : "—");
export const daysLeft = (iso: string | null | undefined) => (iso ? Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000) : null);

const PATHS = {
  key: ["M15 7a4 4 0 1 1-3.9 4.9L4 19v-3h3v-2h2l2.1-2.1A4 4 0 0 1 15 7z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  chip: ["M7 7h10v10H7z", "M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"],
  box: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3 8l9 5 9-5M12 13v8"],
  download: ["M12 4v11", "m7 11 5 5 5-5", "M5 20h14"],
  renew: ["M20 12a8 8 0 1 1-2.4-5.7", "M20 4v5h-5"],
  journal: ["M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z", "M6 3v18", "M10 8h6", "M10 12h6"],
  tools: ["M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M8 7h8", "M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"],
  help: ["M4 5h16v11H9l-5 4z"],
  book: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 13h6", "M10 17h6"],
  check: ["M5 12l5 5 9-10"],
  alert: ["M12 4 2.5 20h19z", "M12 10v4", "M12 17h.01"],
  arrow: ["M9 6l6 6-6 6"],
  mail: ["M3 6h18v12H3z", "m3 7 9 7 9-7"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"],
} as const;
export type IconName = keyof typeof PATHS;

export function Ico({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

const PILL: Record<LicenseState, string> = {
  active: "border-accent/30 bg-accent/10 text-accent",
  expired: "border-red-400/30 bg-red-400/10 text-red-300",
  suspended: "border-amber-300/30 bg-amber-300/10 text-amber-300",
  revoked: "border-red-400/30 bg-red-400/10 text-red-300",
};
export function StatusPill({ state }: { state: LicenseState }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${PILL[state]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />{state}
    </span>
  );
}

export function PageHeader({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Time-left bar for monthly licenses. */
export function Meter({ days, lifetime }: { days: number | null; lifetime?: boolean }) {
  if (lifetime) return <p className="text-sm text-muted">Lifetime access. No expiry date.</p>;
  if (days === null) return null;
  const pct = Math.max(0, Math.min(100, (days / 30) * 100));
  const tone = days <= 0 ? "bg-red-400" : days <= 7 ? "bg-amber-300" : "bg-accent";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{days <= 0 ? "Expired" : "Time left"}</span>
        <span className="font-semibold text-ink">{days <= 0 ? `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago` : `${days} day${days === 1 ? "" : "s"}`}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={30} aria-valuenow={Math.max(0, Math.min(30, days))} aria-label="Days left on license">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Circular days-left dial for the license pass. */
export function Ring({ days, lifetime }: { days: number | null; lifetime?: boolean }) {
  const r = 34, c = 2 * Math.PI * r;
  const pct = lifetime ? 1 : Math.max(0, Math.min(1, (days ?? 0) / 30));
  const tone = lifetime ? "text-accent" : (days ?? 0) <= 0 ? "text-red-400" : (days ?? 0) <= 7 ? "text-amber-300" : "text-accent";
  const left = Math.max(days ?? 0, 0);
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={lifetime ? "Lifetime license" : `${left} days left`}>
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#2A352E" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className={tone} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold leading-none">{lifetime ? "∞" : left}</span>
        <span className="mt-1 text-[11px] text-muted">{lifetime ? "Lifetime" : (days ?? 0) <= 0 ? "expired" : left === 1 ? "day left" : "days left"}</span>
      </div>
    </div>
  );
}
