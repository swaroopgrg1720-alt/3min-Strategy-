import type { Metadata } from "next";
import { Journal } from "@/components/tools/Journal";

export const metadata: Metadata = { title: "Trading Journal", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="font-display text-2xl font-bold sm:text-3xl">Trading Journal</h1>
      <p className="mb-6 mt-1.5 text-[15px] text-muted">Log your trades, see your real statistics and learn from your results.</p>
      <Journal />
    </>
  );
}
