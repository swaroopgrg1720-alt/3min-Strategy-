import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { MarketCards } from "@/components/sections/Cards";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = { title: "Markets", alternates: { canonical: "/markets" }, description: "3MIN SCALP supports EURUSD, GBPUSD and XAUUSD on MetaTrader 5." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Markets" title="Three Markets. One Trading System." text="Supported instruments. Support for a market does not imply profitability on that market." />
      <section className="section"><div className="container-x"><MarketCards /></div></section>
      <CTA />
    </>
  );
}
