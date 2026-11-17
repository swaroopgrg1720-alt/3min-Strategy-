import type { Metadata } from "next";
import { PageHeader, SectionHeading } from "@/components/ui/SectionHeading";
import { PerformanceDashboard, Verification } from "@/components/sections/PerformanceChart";
import { getPerformance } from "@/lib/data/performance";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = { title: "Performance", alternates: { canonical: "/performance" }, description: "Performance preview for 3MIN SCALP. Figures shown are illustrative demo data." };

export default function Page() {
  const data = getPerformance();
  return (
    <>
      <PageHeader eyebrow="Performance" title="Performance, Without the Hype." text="Real verification will replace these preview metrics when sufficient live trading history is available." />
      <section className="section"><div className="container-x">
        <PerformanceDashboard data={data} />
      </div></section>
      <section className="section border-t border-line bg-bg2/40"><div className="container-x">
        <SectionHeading eyebrow="Verification" title="Independent Verification" />
        <Verification />
      </div></section>
      <CTA />
    </>
  );
}
