import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { CryptoCheckout } from "@/components/checkout/CryptoCheckout";
import { isPlanId } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "Checkout", alternates: { canonical: "/checkout" }, robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; order?: string }> }) {
  const { plan, order } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Pay with cryptocurrency" text="Cryptocurrency is the only payment method. Payments are verified manually." />
      <section className="section"><div className="container-x"><CryptoCheckout initialPlan={isPlanId(plan) ? plan : "monthly"} initialOrderId={typeof order === "string" ? order : undefined} /></div></section>
    </>
  );
}
