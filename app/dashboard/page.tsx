import Link from "next/link";

const rows = [
  ["My Product", "3MIN SCALP"],
  ["License", "—"],
  ["Plan", "—"],
  ["Expiration", "—"],
  ["MT5 Account", "Not configured"],
];

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold">Overview</h1>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="card">
            <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-2 text-lg font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/dashboard/downloads" className="btn btn-primary">Download EA</Link>
        <Link href="/documentation" className="btn btn-ghost">Installation Guide</Link>
        <Link href="/dashboard/support" className="btn btn-ghost">Contact Support</Link>
      </div>
    </>
  );
}
