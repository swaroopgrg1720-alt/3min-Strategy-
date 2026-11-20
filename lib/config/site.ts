const env = (v: string | undefined, fallback: string) => (v && v.trim() ? v.trim() : fallback);

/** Accepts "mysite.com" or "https://mysite.com/" and never throws on a bad value. */
function normalizeUrl(v: string | undefined, fallback: string): string {
  const raw = env(v, fallback);
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return fallback;
  }
}

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export const site = {
  name: "3MIN SCALP",
  version: "1.0.0",
  url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000"),
  title: "3MIN SCALP | MT5 Multi-Pair Expert Advisor",
  description:
    "3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD. Explore features, pricing and documentation.",
  keywords: [
    "MT5 Expert Advisor",
    "MetaTrader 5 EA",
    "Forex EA",
    "MT5 EA",
    "automated trading EA",
    "multi-pair EA",
    "Forex Expert Advisor",
    "EURUSD EA",
    "GBPUSD EA",
    "XAUUSD EA",
  ],
  email: env(process.env.NEXT_PUBLIC_BUSINESS_EMAIL, "[BUSINESS EMAIL]"),
  legal: {
    businessName: "[BUSINESS LEGAL NAME]",
    businessAddress: "[BUSINESS ADDRESS]",
    effectiveDate: "[EFFECTIVE DATE]",
  },
  social: [
    { id: "instagram", label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, placeholder: "[INSTAGRAM URL]" },
    { id: "facebook", label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL, placeholder: "[FACEBOOK URL]" },
  ],
  nav: [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/markets", label: "Markets" },
    { href: "/performance", label: "Performance" },
    { href: "/pricing", label: "Pricing" },
    { href: "/documentation", label: "Documentation" },
    { href: "/faq", label: "FAQ" },
  ],
  instruments: ["EURUSD", "GBPUSD", "XAUUSD"] as const,
};

export const DEMO_LABEL = "DEMO DATA — FOR PREVIEW ONLY";
export const ILLUSTRATIVE_LABEL = "ILLUSTRATIVE DATA — NOT ACTUAL PERFORMANCE";
export const PERFORMANCE_NOTICE =
  "Performance figures shown on this preview are illustrative only and do not represent actual trading results.";
