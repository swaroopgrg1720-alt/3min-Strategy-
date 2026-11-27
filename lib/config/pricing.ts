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
    priceUsd: 50,
    priceLabel: "$50",
    cadence: "/ month",
    features: base,
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime",
    priceUsd: 250,
    priceLabel: "$250",
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

/* ───────── TradingView indicator (second product) ───────── */

export type ProductId = "ea" | "indicator";
export const isProductId = (v: unknown): v is ProductId => v === "ea" || v === "indicator";
/** Stored in orders.product so the server knows which fulfilment to run. */
export const INDICATOR_PRODUCT = "TV_INDICATOR";

const usd = (v: string | undefined, fallback = 0) => {
  const n = v?.trim() ? Number(v) : fallback;
  return Number.isFinite(n) && n > 0 && n < 100_000 ? Math.round(n * 100) / 100 : 0;
};

/**
 * Prices come from Vercel (NEXT_PUBLIC_INDICATOR_MONTHLY_USD / _LIFETIME_USD). A plan with no price is not sold,
 * and with no prices at all the indicator shows "Soon" and cannot be bought.
 */
export const indicator = {
  name: process.env.NEXT_PUBLIC_INDICATOR_NAME?.trim() || "3MIN SCALP Indicator",
  tagline: process.env.NEXT_PUBLIC_INDICATOR_TAGLINE?.trim() || "A TradingView indicator built for the 3-minute chart and the New York session.",
  monthlyUsd: usd(process.env.NEXT_PUBLIC_INDICATOR_MONTHLY_USD, 35),
  lifetimeUsd: usd(process.env.NEXT_PUBLIC_INDICATOR_LIFETIME_USD, 200),
};
export const indicatorEnabled = indicator.monthlyUsd > 0 || indicator.lifetimeUsd > 0;
export const indicatorPlanPrice = (plan: PlanId) => (plan === "lifetime" ? indicator.lifetimeUsd : indicator.monthlyUsd);
export const indicatorPlanAvailable = (plan: PlanId) => indicatorPlanPrice(plan) > 0;
export const indicatorTotalUsd = (plan: PlanId, months: number) => (plan === "lifetime" ? indicator.lifetimeUsd : indicator.monthlyUsd * months);
export const isTvUsername = (v: string) => /^[A-Za-z0-9_]{3,30}$/.test(v);
