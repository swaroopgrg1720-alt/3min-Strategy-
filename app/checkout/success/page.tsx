import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

/** Default success page. Also works with no ?order= (e.g. a CryptoPayr payment link that redirects here). */
export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string; renew?: string }> }) {
  const { order, renew } = await searchParams;
  const valid = !!order && /^ORD-[A-F0-9]{12}$/.test(order);
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Thank you for purchasing 3MIN SCALP" text="Your license is issued as soon as the payment is confirmed on the blockchain." />
      <section className="section"><div className="container-x">
        {valid ? <PaymentStatus orderId={order} renewal={renew === "1"} /> : (
          <div className="card mx-auto max-w-xl text-center">
            <h2 className="text-xl font-semibold text-accent">We received your request</h2>
            <p className="mt-2 text-sm text-muted">Once your payment is confirmed, sign in with the email you used at checkout to get your license key and download.</p>
            <a className="btn btn-primary mt-5" href="/login?next=/dashboard/license">Sign in</a>
          </div>
        )}
      </div></section>
    </>
  );
}
