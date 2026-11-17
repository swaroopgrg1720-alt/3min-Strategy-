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
