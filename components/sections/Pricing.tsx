import Link from "next/link";
import { plans, PRICING_NOTE, type Plan } from "@/lib/config/pricing";
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
