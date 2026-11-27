import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Payment cancelled", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; from?: string; product?: string }> }) {
  const { plan, from, product } = await searchParams;
  const pq = product === "indicator" ? "&product=indicator" : "";
  const href = from === "dashboard" ? (pq ? "/dashboard/renew?product=indicator" : "/dashboard/renew") : plan === "monthly" || plan === "lifetime" ? `/checkout?plan=${plan}${pq}` : pq ? "/checkout?product=indicator" : "/checkout";
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Payment cancelled" text="No payment was made and nothing was charged." />
      <section className="section"><div className="container-x">
        <div className="card mx-auto max-w-xl text-center">
          <p className="text-sm text-muted">Changed your mind or something went wrong? You can try again any time. If you already sent a payment, it will be picked up automatically, or contact support with your order ID.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a className="btn btn-primary" href={href}>Try again</a>
            <a className="btn btn-ghost" href="/contact">Contact support</a>
          </div>
        </div>
      </div></section>
    </>
  );
}
