"use client";
import { useState, type ReactNode } from "react";

export function PricingTabs({ ea, indicator, indicatorName, indicatorEnabled, initial = "ea" }: { ea: ReactNode; indicator: ReactNode; indicatorName: string; indicatorEnabled: boolean; initial?: "ea" | "indicator" }) {
  const [tab, setTab] = useState<"ea" | "indicator">(initial);
  const tabs = [
    { id: "ea" as const, label: "MT5 Expert Advisor", sub: "Automated trading" },
    { id: "indicator" as const, label: "TradingView Indicator", sub: indicatorEnabled ? indicatorName : "Coming soon" },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Choose your product" className="mx-auto grid max-w-xl grid-cols-2 gap-1.5 rounded-2xl border border-line bg-bg2 p-1.5">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`rounded-xl px-3 py-3 text-left transition ${tab === t.id ? "bg-forest text-ink shadow-glow" : "text-muted hover:text-ink"}`}>
            <span className="block text-sm font-semibold">{t.label}</span>
            <span className="block text-xs opacity-80">{t.sub}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel">{tab === "ea" ? ea : indicator}</div>
    </div>
  );
}
