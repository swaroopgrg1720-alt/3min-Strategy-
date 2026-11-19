import type { Metadata } from "next";
import { Calculators } from "@/components/tools/Calculators";

export const metadata: Metadata = { title: "Trading Tools", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Trading Tools</h1>
      <p className="mb-6 mt-1.5 text-[15px] text-muted">Calculators that help you size positions and manage risk before you trade.</p>
      <Calculators />
    </>
  );
}
