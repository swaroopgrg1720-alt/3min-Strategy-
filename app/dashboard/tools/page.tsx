import type { Metadata } from "next";
import { Calculators } from "@/components/tools/Calculators";

export const metadata: Metadata = { title: "Trading Tools", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <h1 className="text-2xl font-bold">Trading Tools</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Position sizing, risk/reward, profit/loss and drawdown calculators.</p>
      <Calculators />
    </>
  );
}
