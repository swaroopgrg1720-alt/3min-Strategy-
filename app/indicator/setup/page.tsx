import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/SectionHeading";
import { indicator } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "Setup guide | TradingView Indicator", alternates: { canonical: "/indicator/setup" }, description: "How to add the 3 MIN SCALP TradingView indicator to your chart." };

const steps = [
  ["Log in to your account", "Sign in on this website and open the Indicator page in your dashboard."],
  ["Check your status", "Pending means we are still adding your TradingView username. Active means you can use it."],
  ["Open TradingView", "Sign in to the TradingView account with the username you gave at checkout."],
  ["Open a chart", "Open the chart of the symbol you trade. The indicator is built for the 3 minute chart."],
  ["Add the indicator", "Tap Indicators, choose Invite-only scripts, then tap the indicator to add it."],
  ["Adjust the settings", "Open the indicator settings (the gear icon on the chart) to change what you need."],
  ["Set up alerts", "If you want alerts, use the TradingView alert button and pick the indicator's conditions."],
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Setup guide" title={`How to add ${indicator.name}`} text="Follow these steps once your status shows Active." />
      <section className="section"><div className="container-x max-w-3xl">
        <ol className="space-y-4">
          {steps.map(([t, d], i) => (<li key={t} className="card flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-accent">{i + 1}</span><div><h2 className="font-semibold">{t}</h2><p className="mt-1 text-sm text-muted">{d}</p></div></li>))}
        </ol>
        <p className="mt-6 text-sm text-muted">Menu names can change slightly between the TradingView website and app. If you cannot find the script, tell us in the live chat.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/dashboard/indicator" className="btn btn-primary">Open my indicator</Link><Link href="/contact" className="btn btn-ghost">Need help? Contact support</Link></div>
      </div></section>
    </>
  );
}
