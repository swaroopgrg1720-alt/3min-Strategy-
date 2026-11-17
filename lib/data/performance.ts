/**
 * DEMO DATA — FOR PREVIEW ONLY. Generated deterministically; NOT actual performance.
 * Replace getPerformance() with a call to real, verified data (e.g. a verified-account export)
 * when available. Components only depend on the PerformanceData shape.
 */
import { DEMO_MODE } from "@/lib/config/site";

export interface MonthlyRow {
  month: string;
  returnPct: number;
}
export interface PerformanceData {
  isDemo: boolean;
  roi: string;
  maxDrawdown: string;
  winRate: string;
  profitFactor: string;
  totalTrades: string;
  tradingPeriod: string;
  balance: string;
  equity: string;
  equityCurve: number[];
  monthly: MonthlyRow[];
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getPerformance(): PerformanceData | null {
  if (!DEMO_MODE) return null; // No real data connected yet: UI renders an empty state.
  const rnd = seeded(42);
  const start = 10000;
  const curve: number[] = [];
  let v = start;
  for (let i = 0; i < 60; i++) {
    v += (rnd() - 0.4) * 240;
    curve.push(Math.round(v));
  }
  let peak = curve[0];
  let maxDd = 0;
  for (const p of curve) {
    peak = Math.max(peak, p);
    maxDd = Math.max(maxDd, (peak - p) / peak);
  }
  const last = curve[curve.length - 1];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthly = months.map((m) => ({ month: m, returnPct: Math.round((rnd() * 7 - 1.5) * 10) / 10 }));
  return {
    isDemo: true,
    roi: `${last >= start ? "+" : ""}${(((last - start) / start) * 100).toFixed(1)}%`,
    maxDrawdown: `${(maxDd * 100).toFixed(1)}%`,
    winRate: "58%",
    profitFactor: "1.42",
    totalTrades: "312",
    tradingPeriod: "6 months (sample)",
    balance: `$${start.toLocaleString("en-US")}`,
    equity: `$${last.toLocaleString("en-US")}`,
    equityCurve: curve,
    monthly,
  };
}
