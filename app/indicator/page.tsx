import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IndicatorPricing } from "@/components/sections/Pricing";
import { indicator } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "TradingView Indicator", alternates: { canonical: "/indicator" }, description: "The 3MIN SCALP indicator for TradingView, built for the 3-minute chart and the New York session. Invite-only script added to your TradingView username." };

const facts = ["TradingView", "3-minute chart", "New York session", "Invite-only script", "Monthly or lifetime"];
const steps = [
  ["Pay with crypto", "Choose a plan and enter your TradingView username at checkout."],
  ["We add your username", "Once the payment is confirmed, access is added to your TradingView account by hand."],
  ["Add it to your chart", "Open TradingView, go to Indicators, Invite-only scripts, and add it to any chart."],
];
const faqs = [
  ["Where do I find my TradingView username?", "It is the name in your profile address: tradingview.com/u/username."],
  ["How long until I get access?", "It is added by hand after your payment is confirmed. The status in your dashboard changes from Pending to Active when it is ready."],
  ["Can I renew?", "Yes. Monthly access can be renewed from your dashboard and the time is added to the same access."],
  ["Is trading risky?", "Yes. Trading leveraged products can lose you more than you expect. This indicator is a tool, not financial advice, and does not promise profit."],
];

export default function Page() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_0%,rgba(29,70,54,0.6),transparent)]" aria-hidden="true" />
        <div className="container-x py-14 sm:py-20 lg:py-28">
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow">TradingView indicator</p>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">{indicator.name}</h1>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">{indicator.tagline}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#pricing" className="btn btn-primary">Get the indicator</Link>
              <Link href="#how" className="btn btn-ghost">How it works</Link>
            </div>
            <p className="mt-5 text-sm text-muted">Trading involves risk. No profits are guaranteed.</p>
          </div>
        </div>
      </section>
      <section aria-label="Product facts" className="border-y border-line bg-bg2/50">
        <ul className="container-x flex flex-wrap items-center justify-center gap-2.5 py-6 text-sm text-ink">
          {facts.map((t) => (<li key={t} className="whitespace-nowrap rounded-full border border-line bg-bg px-4 py-1.5">{t}</li>))}
        </ul>
      </section>
      <section id="how" className="section scroll-mt-32"><div className="container-x">
        <SectionHeading title="How access works" />
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="card"><p className="text-sm font-semibold text-accent">Step {i + 1}</p><h3 className="mt-2 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></li>
          ))}
        </ol>
      </div></section>
      <section id="pricing" className="section scroll-mt-32"><div className="container-x"><SectionHeading title="Pricing" /><IndicatorPricing /></div></section>
      <section id="faq" className="section scroll-mt-32"><div className="container-x max-w-3xl">
        <SectionHeading title="Questions" />
        <div className="mt-6 space-y-3">{faqs.map(([q, a]) => (<details key={q} className="card"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-3 text-sm text-muted">{a}</p></details>))}</div>
        <p className="mt-8 text-sm text-muted">Looking for automated trading instead? Switch to the <Link className="text-accent underline" href="/">MT5 EA</Link>.</p>
      </div></section>
    </>
  );
}
