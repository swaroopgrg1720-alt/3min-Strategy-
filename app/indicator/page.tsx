import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionHeading } from "@/components/ui/SectionHeading";
import { IndicatorPricing } from "@/components/sections/Pricing";
import { indicator } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "TradingView Indicator", alternates: { canonical: "/indicator" }, description: "The 3MIN SCALP indicator for TradingView. Invite-only script added to your TradingView username." };

const steps = [
  ["Pay with crypto", "Choose a plan and enter your TradingView username at checkout."],
  ["We add your username", "Once the payment is confirmed, access is added to your TradingView account by hand."],
  ["Add it to your chart", "Open TradingView, go to Indicators, Invite-only scripts, and add it to any chart."],
];
const faqs = [
  ["Where do I find my TradingView username?", "It is the name in your profile address: tradingview.com/u/username."],
  ["How long until I get access?", "It is added by hand after your payment is confirmed. The status in your dashboard changes from Pending to Active when it is ready."],
  ["Can I renew?", "Yes. Monthly access can be renewed from your dashboard and the time is added to the same access."],
  ["Is trading risky?", "Yes. Trading leverage products can lose you more than you expect. This indicator is a tool, not financial advice, and does not promise profit."],
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="TradingView" title={indicator.name} text={indicator.tagline} />
      <section className="section"><div className="container-x">
        <SectionHeading title="How access works" />
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="card"><p className="text-sm font-semibold text-accent">Step {i + 1}</p><h3 className="mt-2 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></li>
          ))}
        </ol>
      </div></section>
      <section className="section"><div className="container-x"><SectionHeading title="Pricing" /><IndicatorPricing /></div></section>
      <section className="section"><div className="container-x max-w-3xl">
        <SectionHeading title="Questions" />
        <div className="mt-6 space-y-3">{faqs.map(([q, a]) => (<details key={q} className="card"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-3 text-sm text-muted">{a}</p></details>))}</div>
        <p className="mt-8 text-sm text-muted">Looking for automated trading instead? See the <Link className="text-accent underline" href="/pricing">MT5 Expert Advisor</Link>.</p>
      </div></section>
    </>
  );
}
