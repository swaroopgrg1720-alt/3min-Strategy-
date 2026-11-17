import Link from "next/link";
import { myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";
const fmt = (d?: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

export default async function Page() {
  const l = (await myLicenses())[0];
  const rows: [string, string][] = [
    ["My Product", "3MIN SCALP"],
    ["License", l ? l.state.charAt(0).toUpperCase() + l.state.slice(1) : "No license yet"],
    ["Plan", l ? (l.plan === "monthly" ? "Monthly" : "Lifetime") : "—"],
    ["Expiration", l ? (l.plan === "lifetime" ? "Lifetime" : fmt(l.expiration_date)) : "—"],
    ["MT5 Account", l?.mt5_account ?? "Not connected yet"],
  ];
  return (
    <>
      <h1 className="text-2xl font-bold">Overview</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (<div key={k} className="card"><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="mt-2 text-lg font-semibold">{v}</dd></div>))}
      </dl>
      {!l && <p className="mt-6 text-sm text-muted">Signed in with a different email than your purchase? Use the same email you ordered with, or <Link className="text-accent underline" href="/contact">contact support</Link>.</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/downloads" className="btn btn-primary">Download EA</Link>
        <Link href="/dashboard/journal" className="btn btn-ghost">Trading Journal</Link>
        <Link href="/dashboard/tools" className="btn btn-ghost">Trading Tools</Link>
        <Link href="/documentation" className="btn btn-ghost">Installation Guide</Link>
        <Link href="/dashboard/support" className="btn btn-ghost">Contact Support</Link>
      </div>
    </>
  );
}
