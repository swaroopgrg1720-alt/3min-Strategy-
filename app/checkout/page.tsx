import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { CryptoCheckout } from "@/components/checkout/CryptoCheckout";
import { isPlanId } from "@/lib/config/pricing";

export const metadata: Metadata = { title: "Checkout", alternates: { canonical: "/checkout" }, robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; product?: string }> }) {
  const { plan, product } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Pay with cryptocurrency" text="Cryptocurrency is the only payment method." />
      <section className="section"><div className="container-x"><CryptoCheckout initialPlan={isPlanId(plan) ? plan : "monthly"} initialProduct={product === "indicator" ? "indicator" : "ea"} /></div></section>
    </>
  );
}
