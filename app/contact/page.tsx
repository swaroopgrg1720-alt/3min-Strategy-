import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/ui/ContactForm";
import { site } from "@/lib/config/site";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" }, description: "Contact 3MIN SCALP support." };

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Support" title="Contact 3MIN SCALP" text="Questions about licensing, installation or your order? Send us a message." />
      <section className="section">
        <div className="container-x grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm />
          <aside className="card h-fit">
            <h2 className="text-lg font-semibold">Email</h2>
            <p className="mt-2 font-mono text-sm text-muted">{site.email}</p>
            <p className="mt-6 text-sm leading-relaxed text-muted">
              For order questions, include your Order ID. Never send private keys or seed phrases to anyone, including us.
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
