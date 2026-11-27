import Link from "next/link";
import { plans, PRICING_NOTE, indicator, indicatorEnabled, indicatorPlanAvailable, indicatorPlanPrice, type Plan } from "@/lib/config/pricing";
import { IconCheck } from "@/components/ui/Icons";

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <article className={`card flex flex-col ${plan.highlight ? "border-accent/50 shadow-glow" : ""}`} data-reveal>
      <p className="eyebrow">{plan.name}</p>
      <p className="mt-4 flex items-baseline gap-2">
        <span className="text-5xl font-bold">{plan.priceLabel}</span>
        <span className="text-sm text-muted">{plan.cadence}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-ink/90">
            <IconCheck className="mt-0.5 shrink-0 text-accent" width={16} height={16} />
            {f}
          </li>
        ))}
      </ul>
      <Link href={`/checkout?plan=${plan.id}`} className={`btn mt-8 ${plan.highlight ? "btn-primary" : "btn-ghost"}`}>
        Pay With Crypto
      </Link>
    </article>
  );
}

export function Pricing() {
  return (
    <div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <PricingCard plan={plans.monthly} />
        <PricingCard plan={plans.lifetime} />
      </div>
      <p className="mt-6 text-center text-xs text-muted">{PRICING_NOTE} Payment accepted in cryptocurrency only.</p>
    </div>
  );
}

export function IndicatorPricing() {
  if (!indicatorEnabled) {
    return (
      <div className="card mx-auto mt-12 max-w-xl text-center">
        <p className="eyebrow">Coming soon</p>
        <h3 className="mt-3 text-xl font-semibold">{indicator.name}</h3>
        <p className="mt-3 text-sm text-muted">{indicator.tagline} It is not on sale yet. Ask us in the live chat to be told when it is.</p>
      </div>
    );
  }
  const features = ["Invite-only TradingView script", "Added to your TradingView username", "Setup guide in your dashboard", "Customer support by live chat"];
  const list = (["monthly", "lifetime"] as const).filter(indicatorPlanAvailable);
  return (
    <div>
      <p className="mt-10 text-center text-sm text-muted">{indicator.tagline}</p>
      <div className={`mt-6 grid gap-5 ${list.length > 1 ? "md:grid-cols-2" : "mx-auto max-w-md"}`}>
        {list.map((id) => (
          <article key={id} className={`card flex flex-col ${id === "lifetime" ? "border-accent/50 shadow-glow" : ""}`}>
            <p className="eyebrow">{id === "monthly" ? "Monthly" : "Lifetime"}</p>
            <p className="mt-4 flex items-baseline gap-2"><span className="text-5xl font-bold">${indicatorPlanPrice(id)}</span><span className="text-sm text-muted">{id === "monthly" ? "per month" : "one time"}</span></p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {features.map((f) => (<li key={f} className="flex items-start gap-2.5 text-ink/90"><IconCheck className="mt-0.5 shrink-0 text-accent" width={16} height={16} />{f}</li>))}
            </ul>
            <Link href={`/checkout?product=indicator&plan=${id}`} className={`btn mt-8 ${id === "lifetime" ? "btn-primary" : "btn-ghost"}`}>Pay With Crypto</Link>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted">Access is added by hand after the payment is confirmed. Payment accepted in cryptocurrency only.</p>
    </div>
  );
}
