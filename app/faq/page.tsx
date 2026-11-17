import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { FAQ, faqs } from "@/components/sections/FAQ";

export const metadata: Metadata = { title: "FAQ", alternates: { canonical: "/faq" }, description: "Frequently asked questions about 3MIN SCALP." };

const ld = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.plain } })),
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader eyebrow="FAQ" title="Frequently asked questions" />
      <section className="section"><div className="container-x max-w-3xl"><FAQ /></div></section>
    </>
  );
}
