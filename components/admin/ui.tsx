import Link from "next/link";

export type Flash = { ok?: string; info?: string; error?: string };
export type AdminSearch = Flash & { t?: string; q?: string; state?: string; status?: string };

export const fmtDate = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
export const fmtDateTime = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") : "—");

/** "in 12 days", "expired 3 days ago", "today" */
export function relDays(d?: string | null): string {
  if (!d) return "";
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
  if (days === 0) return "today";
  return days > 0 ? `in ${days} day${days === 1 ? "" : "s"}` : `${-days} day${days === -1 ? "" : "s"} ago`;
}

/** Keeps the current filters when a button sends the admin back to this page. */
export function backTo(path: string, params: Record<string, string | undefined>) {
  const u = new URL(path, "http://local");
  for (const [k, v] of Object.entries(params)) if (v) u.searchParams.set(k, v);
  return u.pathname + u.search;
}

export const field = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-base";
export const smallBtn = "btn btn-ghost !min-h-[40px] !px-4 !py-2 !text-sm";
export const smallPrimary = "btn btn-primary !min-h-[40px] !px-4 !py-2 !text-sm";

const TONES = {
  good: "border-accent/40 bg-accent/10 text-accent",
  warn: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  bad: "border-red-400/40 bg-red-400/10 text-red-300",
  neutral: "border-line bg-bg text-muted",
} as const;
export type Tone = keyof typeof TONES;

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>{children}</span>;
}

export const licenseTone = (s: string): Tone => (s === "active" ? "good" : s === "expired" ? "warn" : "bad");

const ORDER: Record<string, { label: string; tone: Tone }> = {
  confirmed: { label: "Paid", tone: "good" },
  pending: { label: "Awaiting payment", tone: "warn" },
  payment_detected: { label: "Needs review", tone: "warn" },
  expired: { label: "Expired", tone: "neutral" },
  failed: { label: "Failed", tone: "bad" },
  refunded: { label: "Refunded", tone: "bad" },
};
export function OrderBadge({ status }: { status: string }) {
  const o = ORDER[status] ?? { label: status, tone: "neutral" as Tone };
  return <Badge tone={o.tone}>{o.label}</Badge>;
}

/** Green / grey / red notice after an action. */
export function FlashBanner({ ok, info, error }: Flash) {
  if (!ok && !info && !error) return null;
  const [tone, text] = error ? (["bad", error] as const) : ok ? (["good", ok] as const) : (["neutral", info!] as const);
  return (
    <p role={error ? "alert" : "status"} className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${TONES[tone]}`}>
      {error ? <strong>Could not do that: </strong> : null}
      {text}
    </p>
  );
}

export function PageHead({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "neutral" }: { label: string; value: React.ReactNode; hint?: string; tone?: Tone }) {
  return (
    <div className="rounded-2xl border border-line bg-bg2 p-4 sm:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold sm:text-3xl ${tone === "good" ? "text-accent" : tone === "warn" ? "text-amber-300" : tone === "bad" ? "text-red-300" : ""}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <p className="font-semibold">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{text}</p>}
    </div>
  );
}

/** Row of filter pills. Each is a plain link, so it works without JavaScript. */
export function Chips({ base, param, active, options, keep = {} }: { base: string; param: string; active: string; options: { value: string; label: string; count?: number }[]; keep?: Record<string, string | undefined> }) {
  return (
    <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
      {options.map((o) => {
        const on = (active || options[0].value) === o.value;
        return (
          <Link key={o.value} role="tab" aria-selected={on} href={backTo(base, { ...keep, [param]: o.value === options[0].value ? undefined : o.value })}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${on ? "border-accent bg-accent/10 font-semibold text-accent" : "border-line text-muted"}`}>
            {o.label}{typeof o.count === "number" ? <span className="ml-1.5 opacity-70">{o.count}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}

export function SearchBox({ action, q, placeholder, keep = {} }: { action: string; q?: string; placeholder: string; keep?: Record<string, string | undefined> }) {
  return (
    <form action={action} method="get" className="mb-4 flex gap-2">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input name="q" defaultValue={q ?? ""} placeholder={placeholder} aria-label={placeholder} className={field} />
      <button className="btn btn-primary shrink-0 !px-5">Search</button>
    </form>
  );
}
