import Link from "next/link";
import { Empty } from "@/components/dashboard/DashboardShell";
import { Ico, PageHeader, dmy } from "@/components/dashboard/ui";
import { currentProduct, myLicenses } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

const STEPS = [
  ["Download", "Save the EX5 file to your computer."],
  ["Open the data folder", "In MetaTrader 5 choose File, then Open Data Folder, then MQL5, then Experts."],
  ["Copy the file", "Paste the EX5 file into the Experts folder and restart MetaTrader 5."],
  ["Attach and activate", "Drag 3MIN SCALP onto a chart, allow algo trading, and paste your license key."],
];

export default async function Page() {
  const [lics, product] = await Promise.all([myLicenses(), currentProduct()]);
  const ok = lics.some((l) => l.state === "active");
  return (
    <>
      <PageHeader title="Download" text="Get the latest version of the EA." />
      {ok ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-line bg-bg p-5">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest/60 text-accent"><Ico name="box" size={28} /></span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">3MIN SCALP</h2>
                <p className="mt-0.5 text-sm text-muted">MetaTrader 5 Expert Advisor (EX5){product?.version ? ` · Version ${product.version.replace(/^v/i, "")}` : ""}</p>
                {product?.created_at && <p className="text-xs text-muted">Released {dmy(product.created_at)}</p>}
              </div>
            </div>
            {product?.release_notes && (
              <div className="mt-4 rounded-xl border border-line bg-bg2/60 p-3.5">
                <p className="text-xs font-semibold text-muted">What&apos;s new</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{product.release_notes}</p>
              </div>
            )}
            <a href="/api/download" className="mt-5 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-bg active:brightness-95"><Ico name="download" size={20} />Download EA</a>
            <p className="mt-3 text-xs leading-relaxed text-muted">Your download link is created securely and expires within a minute. Need your key? Open <Link href="/dashboard/license" className="text-accent underline">My License</Link>.</p>
          </section>

          <section className="rounded-2xl border border-line bg-bg p-5">
            <h2 className="font-display text-lg font-semibold">Install in 4 steps</h2>
            <ol className="mt-4 space-y-4">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/50 text-xs font-bold text-accent">{i + 1}</span>
                  <div><p className="text-sm font-semibold">{t}</p><p className="text-sm leading-relaxed text-muted">{d}</p></div>
                </li>
              ))}
            </ol>
            <Link href="/dashboard/documentation" className="mt-5 inline-flex min-h-[44px] items-center rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40">Full installation guide</Link>
          </section>
        </div>
      ) : (
        <Empty title="No active license" text="Downloads are available with an active license. Renew or buy a license to continue." />
      )}
    </>
  );
}
