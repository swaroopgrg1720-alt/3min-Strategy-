export type PlanId = "monthly" | "lifetime";

export interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number;
  priceLabel: string;
  cadence: string;
  features: string[];
  highlight?: boolean;
}

const base = [
  "3MIN SCALP",
  "MetaTrader 5",
  "EURUSD",
  "GBPUSD",
  "XAUUSD",
  "Installation guide",
  "Product updates",
  "Customer support",
];

export const plans: Record<PlanId, Plan> = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    priceUsd: 29,
    priceLabel: "$29",
    cadence: "/ month",
    features: base,
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    priceUsd: 199,
    priceLabel: "$199",
    cadence: "one-time payment",
    features: [...base, "Lifetime license"],
    highlight: true,
  },
};

export const PRICING_NOTE = "Introductory launch pricing. Pricing may change.";

export const isPlanId = (v: unknown): v is PlanId => v === "monthly" || v === "lifetime";

export const MAX_MONTHS = 12;

/** Whole months 1..12 (monthly plan only). Anything else becomes 1. */
export const parseMonths = (v: unknown): number => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 1 && n <= MAX_MONTHS ? n : 1;
};

/** Server-side price for an order. Lifetime ignores months. */
export const orderTotalUsd = (plan: PlanId, months: number) => (plan === "lifetime" ? plans.lifetime.priceUsd : plans.monthly.priceUsd * months);
