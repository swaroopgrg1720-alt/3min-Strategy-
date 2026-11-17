import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const sections = [
  { name: "Orders", cols: ["Order ID", "Customer", "Product", "Plan", "Amount", "Payment status", "Date"] },
  { name: "Customers", cols: ["Email", "License", "Plan", "Status"] },
  { name: "Licenses", cols: ["License ID", "Customer", "Product", "Expiration", "Status"] },
  { name: "Products", cols: ["Product", "Version", "Download"] },
  { name: "Support", cols: ["Tickets", "Customer", "Status"] },
];

export default function Page() {
  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-bold">Admin</h1>
      <p role="status" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">
        Architecture placeholder. This route must be protected by server-side admin authentication before any data is shown. No data is loaded.
      </p>
      <div className="mt-8 grid gap-6">
        {sections.map((s) => (
          <section key={s.name} className="card overflow-x-auto" aria-labelledby={`a-${s.name}`}>
            <h2 id={`a-${s.name}`} className="text-lg font-semibold">{s.name}</h2>
            <table className="mt-4 w-full min-w-[480px] text-left text-sm">
              <thead><tr className="text-xs uppercase tracking-wider text-muted">{s.cols.map((c) => <th key={c} className="py-2 pr-4 font-medium">{c}</th>)}</tr></thead>
              <tbody><tr><td colSpan={s.cols.length} className="py-6 text-muted">No data. Connect the database to populate.</td></tr></tbody>
            </table>
          </section>
        ))}
      </div>
    </div>
  );
}
