import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IndicatorPricing } from "@/components/sections/Pricing";
import { ChartPreview } from "@/components/indicator/ChartPreview";
import { indicator, indicatorEnabled, indicatorPlanAvailable, indicatorPlanPrice } from "@/lib/config/pricing";
import { indicatorContent as C } from "@/lib/config/indicator-content";
import { site } from "@/lib/config/site";

const TITLE = "3 MIN SCALP TradingView Indicator | Trading Signals & Scalping Tool";
const DESC = "Trade smarter with the 3 MIN SCALP TradingView Indicator. Analyze market conditions, identify trading opportunities, and customize your TradingView setup.";
export const metadata: Metadata = {
  title: { absolute: TITLE }, description: DESC, alternates: { canonical: "/indicator" },
  openGraph: { title: TITLE, description: DESC, url: "/indicator", type: "website" },
};

const flow = ["Purchase", "Access", "TradingView", "Add indicator", "Analyze", "Trade"];
const steps = [
  ["Buy the indicator", "Pay with crypto and enter your TradingView username at checkout."],
  ["We give you access", "After the payment is confirmed, your username is added to the invite-only script by hand. Your dashboard shows Pending, then Active."],
  ["Open TradingView", "Sign in to TradingView and open a chart."],
  ["Add the indicator", "Click Indicators, choose Invite-only scripts and add it. The setup guide shows each tap."],
  ["You make the decisions", "You are responsible for your entries, exits, position size and risk."],
];
const faqs: [string, string][] = [
  ["What is the TradingView indicator?", `${indicator.name} is an invite-only TradingView script built for the ${C.primaryTimeframe} chart and the New York session. It combines trend analysis, technical analysis and breakout conditions to show potential buy and sell signals with entry, stop loss and take profit levels. It is an analysis tool and does not place trades for you.`],
  ["How do I get access after paying?", "Once your payment is confirmed we add the TradingView username you entered at checkout. This is done by hand. Your dashboard changes from Pending to Active when it is ready."],
  ["Do I need a TradingView account?", "Yes. Access is given to a TradingView username, so you need an account. Check TradingView's own plans for what your plan allows."],
  ["Does it place trades automatically?", "No. It is an indicator on a chart. You decide and place every trade yourself."],
  ["Does it show buy and sell signals?", "Yes. It shows directional buy and sell signals on the chart, and supported setups can display entry, stop loss and take profit levels. Signals are potential setups, not guarantees."],
  ["Which markets does it support?", "It can be used across many instruments and asset classes. It is primarily designed and developed with XAU/USD (Gold) in mind."],
  ["Does it work on mobile?", "Yes. It works on the TradingView mobile app."],
  ["Is there a monthly plan and a lifetime plan?", "Yes. Monthly access lasts 30 days per month bought. Lifetime is a one-time payment for the current indicator."],
  ["Does my subscription renew by itself?", "No. Payments are made in crypto, so nothing is charged automatically. You renew from your dashboard when you want more time."],
  ["What happens when my access expires?", "Your access is removed from the TradingView script. Renew from your dashboard and the time is added to the same username."],
  ["Can I change my TradingView username?", "Contact support through the live chat with your order number."],
  ["Can I share my access?", "No. Access belongs to one TradingView username."],
  ["What is the refund policy?", "Please read the refund policy page before you buy."],
  ["How do I contact support?", "Use the live chat on this site or the contact page."],
  ["Is trading risky?", "Yes. Trading involves substantial risk, and this indicator does not guarantee profits."],
];

export default function Page() {
  const jsonLd = indicatorEnabled ? {
    "@context": "https://schema.org", "@type": "Product", name: indicator.name, description: DESC, brand: { "@type": "Brand", name: site.name },
    offers: (["monthly", "lifetime"] as const).filter(indicatorPlanAvailable).map((p) => ({ "@type": "Offer", name: p === "monthly" ? "Monthly" : "Lifetime", price: String(indicatorPlanPrice(p)), priceCurrency: "USD" })),
  } : null;
  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_0%,rgba(29,70,54,0.6),transparent)]" aria-hidden="true" />
        <div className="container-x grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div data-reveal>
            <p className="eyebrow">Trend. Analysis. Breakout. Execution.</p>
            <h1 className="mt-5 text-[2.4rem] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">{indicator.name}</h1>
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted sm:text-lg">The 3 MIN SCALP TradingView indicator combines trend analysis, technical analysis and breakout conditions to identify potential trading opportunities directly on your chart.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#pricing" className="btn btn-primary">Get the indicator</Link>
              <Link href="#how" className="btn btn-ghost">View how it works</Link>
              <Link href="/login" className="btn btn-ghost">Login</Link>
            </div>
            <p className="mt-5 text-sm text-muted">Trading involves risk. No profits are guaranteed.</p>
          </div>
          <div data-reveal><ChartPreview /></div>
        </div>
      </section>
      <section aria-label="Product facts" className="border-y border-line bg-bg2/50">
        <ul className="container-x flex flex-wrap items-center justify-center gap-2.5 py-6 text-sm text-ink">
          {["TradingView", `${C.primaryTimeframe} chart`, "New York session", "Invite-only script", "Works on TradingView mobile", "Monthly or lifetime"].map((t) => (<li key={t} className="whitespace-nowrap rounded-full border border-line bg-bg px-4 py-1.5">{t}</li>))}
        </ul>
      </section>

      <section id="how" className="section scroll-mt-32"><div className="container-x">
        <SectionHeading title="How it works" text="From payment to your chart in a few steps." />
        <ol className="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Flow">
          {flow.map((f, i) => (<li key={f} className="flex items-center gap-2"><span className="rounded-full border border-accent/30 bg-forest/30 px-3 py-1.5 text-accent">{f}</span>{i < flow.length - 1 && <span className="text-muted" aria-hidden="true">›</span>}</li>))}
        </ol>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(([t, d], i) => (<li key={t} className="card"><p className="text-sm font-semibold text-accent">Step {i + 1}</p><h3 className="mt-2 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></li>))}
        </ol>
        <Link href="/indicator/setup" className="btn btn-ghost mt-8">Open the setup guide</Link>
      </div></section>

      {C.features.length > 0 && (
        <section id="features" className="section scroll-mt-32"><div className="container-x">
          <SectionHeading title="Key features" text="Built for fast market analysis: the most important information in one view, so you can see potential direction, breakout opportunities and predefined trade levels without calculating every level by hand." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{C.features.map((f) => (<article key={f.title} className="card transition hover:-translate-y-0.5 hover:border-accent/40"><h3 className="text-lg font-semibold">{f.title}</h3><p className="mt-2 text-sm text-muted">{f.text}</p></article>))}</div>
        </div></section>
      )}

      <section id="timeframe" className="section scroll-mt-32"><div className="container-x">
        <SectionHeading title="Timeframe and markets" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="card"><p className="text-sm text-muted">Primary timeframe</p><p className="mt-2 text-3xl font-bold text-accent">{C.primaryTimeframe}</p><p className="mt-2 text-sm text-muted">The indicator is built around this chart, with the New York session in mind.</p></article>
          <article className="card"><p className="text-sm text-muted">Supported markets</p>
            {C.markets.length > 0 ? <><ul className="mt-3 flex flex-wrap gap-2">{C.markets.map((m) => <li key={m} className="rounded-full border border-line px-3 py-1 text-sm">{m}</li>)}</ul><p className="mt-3 text-sm text-muted">Works across many instruments and asset classes. Check the indicator and TradingView compatibility for your symbol before you buy.</p></> : <p className="mt-2 text-sm text-muted">Works across many instruments and asset classes. Check the indicator and TradingView compatibility for your symbol before you buy.</p>}
          </article>
        </div>
      </div></section>

      {C.alerts.length > 0 && (
        <section id="alerts" className="section scroll-mt-32"><div className="container-x">
          <SectionHeading title="Alerts" text="Set up TradingView alerts for the conditions the indicator supports." />
          <ul className="mt-6 flex flex-wrap gap-2">{C.alerts.map((a) => <li key={a} className="rounded-full border border-line bg-bg2 px-4 py-2 text-sm">{a}</li>)}</ul>
        </div></section>
      )}

      <section id="pricing" className="section scroll-mt-32"><div className="container-x">
        <SectionHeading title="Pricing" text="Pay in crypto. Nothing renews automatically." />
        <IndicatorPricing />
        {indicatorEnabled && indicatorPlanAvailable("monthly") && indicatorPlanAvailable("lifetime") && (
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead><tr className="border-b border-line text-muted"><th className="py-3 pr-3 font-medium">&nbsp;</th><th className="py-3 pr-3 font-medium">Monthly</th><th className="py-3 font-medium">Lifetime</th></tr></thead>
              <tbody className="[&_td]:border-b [&_td]:border-line/60 [&_td]:py-3 [&_td]:pr-3">
                <tr><td className="text-muted">Price</td><td>${indicatorPlanPrice("monthly")} per month</td><td>${indicatorPlanPrice("lifetime")} one time</td></tr>
                <tr><td className="text-muted">TradingView indicator</td><td className="text-accent">Included</td><td className="text-accent">Included</td></tr>
                <tr><td className="text-muted">Access length</td><td>30 days per month bought</td><td>No expiry for the current indicator</td></tr>
                <tr><td className="text-muted">Renewal</td><td>Manual, from your dashboard</td><td>Not needed</td></tr>
                <tr><td className="text-muted">Setup guide and support</td><td className="text-accent">Included</td><td className="text-accent">Included</td></tr>
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-6 text-sm text-muted">Read the <Link className="text-accent underline" href="/refund-policy">refund policy</Link> and <Link className="text-accent underline" href="/terms">terms</Link> before you buy.</p>
      </div></section>

      <section id="reviews" className="section scroll-mt-32"><div className="container-x">
        <SectionHeading title="Reviews" />
        {C.reviews.length === 0 ? <p className="mt-6 text-muted">Be the first to review {indicator.name}.</p> : (
          <ul className="mt-6 grid gap-4 md:grid-cols-2">{C.reviews.map((r) => (<li key={r.name + r.date} className="card"><p className="text-accent" aria-label={`${r.rating} out of 5`}>{"★".repeat(r.rating)}</p><p className="mt-2 text-sm">{r.text}</p><p className="mt-3 text-xs text-muted">{r.name} · {r.date}{r.verified ? " · Verified purchase" : ""}</p></li>))}</ul>
        )}
      </div></section>

      {C.changelog.length > 0 && (
        <section id="changelog" className="section scroll-mt-32"><div className="container-x max-w-3xl">
          <SectionHeading title="Changelog" />
          <ul className="mt-6 space-y-3">{C.changelog.map((c) => (<li key={c.version} className="card"><p className="font-semibold">Version {c.version} <span className="text-sm font-normal text-muted">· {c.date}</span></p><p className="mt-1 text-sm text-muted">{c.note}</p></li>))}</ul>
        </div></section>
      )}

      <section id="faq" className="section scroll-mt-32"><div className="container-x max-w-3xl">
        <SectionHeading title="Questions" />
        <div className="mt-6 space-y-3">{faqs.map(([q, a]) => (<details key={q} className="card"><summary className="cursor-pointer font-medium">{q}</summary><p className="mt-3 text-sm text-muted">{a}</p></details>))}</div>
      </div></section>

      <section id="support" className="section scroll-mt-32"><div className="container-x">
        <div className="card text-center">
          <h2 className="text-2xl font-bold">Need help?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">For installation, billing, access or technical questions, contact support.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/contact" className="btn btn-primary">Contact support</Link><Link href="#faq" className="btn btn-ghost">View FAQ</Link><Link href="/indicator/setup" className="btn btn-ghost">Open setup guide</Link></div>
        </div>
        <aside className="mt-8 rounded-2xl border border-line bg-bg2/60 p-5 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-ink">Risk disclosure</p>
          <p className="mt-1">Trading involves substantial risk and is not suitable for every investor. The {indicator.name} is an analytical tool and does not guarantee profits or trading success. Past performance or historical examples do not guarantee future results. You are responsible for your own trading decisions, risk management and account activity. <Link className="text-accent underline" href="/risk-disclosure">Read the full risk disclosure</Link>.</p>
        </aside>
        <p className="mt-6 text-sm text-muted">Looking for automated trading instead? Switch to the <Link className="text-accent underline" href="/">MT5 EA</Link>.</p>
      </div></section>
    </>
  );
}
