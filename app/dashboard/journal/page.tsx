import type { Metadata } from "next";
import { Journal } from "@/components/tools/Journal";

export const metadata: Metadata = { title: "Trading Journal", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold">Trading Journal</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Log trades, review your statistics and learn from your results.</p>
      <Journal />
    </>
  );
}
