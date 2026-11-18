import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { PaymentStatus } from "@/components/checkout/PaymentStatus";

export const metadata: Metadata = { title: "Payment status", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return (
    <>
      <PageHeader eyebrow="Checkout" title="Payment status" text="Your license is issued as soon as the payment is confirmed." />
      <section className="section"><div className="container-x">
        {order && /^ORD-[A-F0-9]{12}$/.test(order)
          ? <PaymentStatus orderId={order} />
          : <p className="text-center text-muted">Order not found. <a className="text-accent underline" href="/checkout">Back to checkout</a></p>}
      </div></section>
    </>
  );
}
