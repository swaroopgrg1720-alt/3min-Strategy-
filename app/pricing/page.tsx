import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { Pricing, IndicatorPricing } from "@/components/sections/Pricing";
import { PricingTabs } from "@/components/sections/PricingTabs";
import { indicator, indicatorEnabled } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "Pricing", alternates: { canonical: "/pricing" }, description: "Pricing for the 3MIN SCALP MT5 Expert Advisor and TradingView indicator. Cryptocurrency payments only." };

export default async function Page({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Pricing" title="Choose your product" text="Pick the MT5 Expert Advisor or the TradingView indicator. Monthly or lifetime access. Cryptocurrency is the only supported payment method." />
      <section className="section"><div className="container-x">
        <PricingTabs ea={<Pricing />} indicator={<IndicatorPricing />} indicatorName={indicator.name} indicatorEnabled={indicatorEnabled} initial={product === "indicator" ? "indicator" : "ea"} />
      </div></section>
    </>
  );
}
