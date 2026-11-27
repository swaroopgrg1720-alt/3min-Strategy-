import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { myIndicatorAccess } from "@/lib/db/customer";
import { Ico, PageHeader, daysLeft, dmy } from "@/components/dashboard/ui";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { indicator, indicatorEnabled } from "@/lib/config/pricing";

export const dynamic = "force-dynamic";

const TONE = {
  pending: ["Pending", "border-sun/40 bg-sun/10 text-sun"],
  active: ["Active", "border-accent/30 bg-accent/10 text-accent"],
  expired: ["Expired", "border-line bg-bg2 text-muted"],
  revoked: ["Revoked", "border-red-400/30 bg-red-400/10 text-red-300"],
} as const;

const STEPS = [
  ["Wait for Active", "We add your TradingView username by hand after the payment is confirmed. The status here changes to Active."],
  ["Open TradingView", "Open any chart and click Indicators at the top."],
  ["Find invite-only scripts", "Choose Invite-only scripts and pick the indicator."],
  ["Add it to your chart", "Click it once to add it. Use it on the markets and timeframes you trade."],
];

export default async function Page() {
  await requireUser();
  const rows = await myIndicatorAccess();
  return (
    <>
      <PageHeader title="TradingView Indicator" text={indicatorEnabled ? indicator.name : "Your TradingView indicator access."} />
      {rows.length === 0 ? (
        <section className="rounded-2xl border border-line bg-bg p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-forest/60 text-accent"><Ico name="chip" size={24} /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">No indicator access yet</h2>
          <p className="mt-1 text-sm text-muted">{indicatorEnabled ? "Buy it with crypto and we add it to your TradingView username." : "It is not on sale yet."}</p>
          {indicatorEnabled && <Link href="/dashboard/renew?product=indicator" className="btn btn-primary mt-5">Buy the indicator</Link>}
        </section>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {rows.map((a) => {
            const [label, cls] = TONE[a.state];
            const left = daysLeft(a.expires_at);
            return (
              <li key={a.id} className="rounded-2xl border border-line bg-bg p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0"><p className="text-sm text-muted">TradingView username</p><p className="break-all font-mono text-lg text-accent">@{a.tv_username}</p></div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{label}</span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-muted">Plan</dt><dd className="font-medium">{a.plan === "lifetime" ? "Lifetime" : "Monthly"}</dd></div>
                  <div><dt className="text-muted">{a.plan === "lifetime" ? "Expires" : "Expires on"}</dt><dd className="font-medium">{a.plan === "lifetime" ? "Never" : a.expires_at ? `${dmy(a.expires_at)}${left !== null && left > 0 ? ` (${left} days)` : ""}` : "Starts when added"}</dd></div>
                </dl>
                {a.state === "pending" && <p className="mt-4 rounded-xl bg-sun/10 p-3 text-sm text-sun">Payment received. We are adding your username now. Need it faster? Message us in the live chat with order {a.order_id}.</p>}
                {a.state === "revoked" && <p className="mt-4 text-sm text-muted">This access was removed. Contact support if this looks wrong.</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyButton value={a.tv_username} label="Copy username" className="btn btn-ghost !min-h-[40px] !px-4 !py-2 !text-sm" />
                  {a.plan === "monthly" && a.state !== "revoked" && <Link href={`/dashboard/renew?product=indicator&access=${a.id}`} className="btn btn-primary !min-h-[40px] !px-4 !py-2 !text-sm">Renew</Link>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <section className="mt-6 rounded-2xl border border-line bg-bg p-5">
        <h2 className="font-display text-lg font-semibold">How to use it</h2>
        <ol className="mt-3 space-y-3 text-sm">
          {STEPS.map(([t, d], i) => (<li key={t} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest text-xs font-semibold text-accent">{i + 1}</span><span><span className="font-medium">{t}.</span> <span className="text-muted">{d}</span></span></li>))}
        </ol>
      </section>
    </>
  );
}
