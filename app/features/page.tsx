import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { CardGrid, featureCards } from "@/components/sections/Cards";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = { title: "Features", alternates: { canonical: "/features" }, description: "Features of 3MIN SCALP, a MetaTrader 5 multi-pair Expert Advisor." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Features" title="Built for MetaTrader 5" text="What 3MIN SCALP is, without the hype." />
      <section className="section"><div className="container-x"><CardGrid items={featureCards} />
        <p className="mt-8 text-sm text-muted">Features are described only as far as they are confirmed. Capabilities are added to this page when they are verified.</p>
      </div></section>
      <CTA />
    </>
  );
}
