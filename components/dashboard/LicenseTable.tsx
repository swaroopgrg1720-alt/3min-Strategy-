"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type LicenseState = "active" | "expired" | "suspended" | "revoked";
export interface LicenseView {
  id: string;
  license_ref: string;
  plan: "monthly" | "lifetime";
  start_date: string;
  expiration_date: string | null;
  mt5_account: string | null;
  state: LicenseState;
}

const PAGE = 6;
const dmy = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("-") : "—");
const PILL: Record<LicenseState, string> = {
  active: "bg-accent/15 text-accent",
  expired: "bg-red-500/80 text-white",
  suspended: "bg-amber-400 text-bg",
  revoked: "bg-red-500/80 text-white",
};
const select = "w-full rounded-xl border border-accent/40 bg-bg px-4 py-2.5 text-sm text-ink focus:border-accent";

export function LicenseTable({ licenses }: { licenses: LicenseView[] }) {
  const [plan, setPlan] = useState("all");
  const [state, setState] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => licenses.filter((l) => (plan === "all" || l.plan === plan) && (state === "all" || l.state === state)), [licenses, plan, state]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const current = Math.min(page, pages);
  const slice = rows.slice((current - 1) * PAGE, current * PAGE);

  return (
    <section aria-label="My licenses">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="sr-only" htmlFor="f-plan">Plan</label>
        <select id="f-plan" value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }} className={select}>
          <option value="all">All Plans</option><option value="monthly">Monthly</option><option value="lifetime">Lifetime</option>
        </select>
        <label className="sr-only" htmlFor="f-state">Status</label>
        <select id="f-state" value={state} onChange={(e) => { setState(e.target.value); setPage(1); }} className={select}>
          <option value="all">All Statuses</option><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option><option value="revoked">Revoked</option>
        </select>
        <Link href="/pricing" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>
          Get / Renew License
        </Link>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-left text-sm">
          <thead>
            <tr className="text-xs text-muted">
              {["License", "Plan", "Start Date", "Expires", "MT5 Account", "Status", "Action"].map((h) => <th key={h} scope="col" className="px-4 py-2 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {slice.map((l) => (
              <tr key={l.id} className="bg-bg">
                <td className="rounded-l-xl px-4 py-3.5 font-mono text-xs">{l.license_ref}</td>
                <td className="px-4 py-3.5 capitalize">{l.plan}</td>
                <td className="px-4 py-3.5">{dmy(l.start_date)}</td>
                <td className="px-4 py-3.5">{l.plan === "lifetime" ? "Lifetime" : dmy(l.expiration_date)}</td>
                <td className="px-4 py-3.5 font-mono text-xs">{l.mt5_account ?? "Not set"}</td>
                <td className="px-4 py-3.5"><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${PILL[l.state]}`}>{l.state}</span></td>
                <td className="rounded-r-xl px-4 py-3.5">
                  <Link href="/dashboard/license" aria-label={`Open license ${l.license_ref}`} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:border-accent/50 hover:text-accent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 7a4 4 0 1 1-3.9 4.9L4 19v-3h3v-2h2l2.1-2.1A4 4 0 0 1 15 7z" /></svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {slice.length === 0 && (
          <p className="rounded-xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">
            {licenses.length === 0 ? "No licenses yet. Choose a plan to get started." : "No licenses match these filters."}
          </p>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-center gap-2 text-sm">
          <button onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page" className="h-9 w-9 rounded-lg text-muted disabled:opacity-30">‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} aria-current={p === current ? "page" : undefined}
              className={`h-9 min-w-9 rounded-lg px-2 font-medium ${p === current ? "bg-accent text-bg" : "text-muted hover:text-ink"}`}>{String(p).padStart(2, "0")}</button>
          ))}
          <button onClick={() => setPage(Math.min(pages, current + 1))} disabled={current === pages} aria-label="Next page" className="h-9 w-9 rounded-lg text-muted disabled:opacity-30">›</button>
        </nav>
      )}
    </section>
  );
}
