import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = { title: "Pricing", alternates: { canonical: "/pricing" }, description: "3MIN SCALP pricing: $29 per month or $199 lifetime. Cryptocurrency payments only." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Pricing" title="Choose your license" text="Monthly or lifetime access. Cryptocurrency is the only supported payment method." />
      <section className="section"><div className="container-x"><Pricing /></div></section>
    </>
  );
}
