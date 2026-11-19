import { DemoBadge } from "@/components/ui/DemoBadge";
import { PERFORMANCE_NOTICE } from "@/lib/config/site";
import type { PerformanceData } from "@/lib/data/performance";

function EquityCurve({ data }: { data: number[] }) {
  const w = 600;
  const h = 220;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 10 - ((v - min) / (max - min || 1)) * (h - 30)]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Illustrative equity curve. Demo data, not actual performance.">
      <defs>
        <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00E59B" stopOpacity="0.3" /><stop offset="1" stopColor="#00E59B" stopOpacity="0" /></linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (<line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke="#2A352E" />))}
      <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="url(#eq)" />
      <path d={line} pathLength={1} className="draw-line" fill="none" stroke="#00E59B" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function PerformanceDashboard({ data }: { data: PerformanceData | null }) {
  if (!data) {
    return (
      <div className="card mt-10 text-center">
        <p className="text-lg font-semibold">No verified performance data published yet</p>
        <p className="mt-2 text-sm text-muted">Real data will appear here when sufficient live trading history is available.</p>
      </div>
    );
  }
  const stats: [string, string][] = [
    ["ROI", data.roi], ["Max drawdown", data.maxDrawdown], ["Win rate", data.winRate], ["Profit factor", data.profitFactor],
    ["Total trades", data.totalTrades], ["Trading period", data.tradingPeriod], ["Balance", data.balance], ["Equity", data.equity],
  ];
  return (
    <div className="mt-10">
      <div role="note" className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 text-sm font-medium text-amber-200">
        {PERFORMANCE_NOTICE}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="card !p-5">
            <div className="flex items-start justify-between gap-2"><p className="text-xs text-muted">{k}</p><DemoBadge /></div>
            <p className="mt-2 text-2xl font-bold">{v}</p>
            <p className="mt-2 text-[9px] font-semibold uppercase leading-tight tracking-wider text-muted/80">Illustrative data — not actual performance</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Equity curve</h3><DemoBadge variant="demo" />
          </div>
          <EquityCurve data={data.equityCurve} />
          <p className="mt-2 text-xs uppercase tracking-wider text-muted">Illustrative data — not actual performance</p>
        </div>
        <div className="card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Monthly returns</h3><DemoBadge />
          </div>
          <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Illustrative monthly returns (demo data)</caption>
            <thead><tr className="text-left text-xs text-muted"><th className="pb-2 font-medium">Month</th><th className="pb-2 text-right font-medium">Return</th></tr></thead>
            <tbody>
              {data.monthly.map((m) => (
                <tr key={m.month} className="border-t border-line">
                  <td className="py-2.5">{m.month}</td>
                  <td className={`py-2.5 text-right font-semibold ${m.returnPct >= 0 ? "text-accent" : "text-rose-400"}`}>{m.returnPct >= 0 ? "+" : ""}{m.returnPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted">Demo data — for preview only</p>
        </div>
      </div>
    </div>
  );
}

export function Verification() {
  const items = [
    ["Myfxbook", "Verification Coming Soon"],
    ["FX Blue", "Verification Coming Soon"],
    ["Live Account", "Live Track Record Coming Soon"],
    ["Trading History", "Data Will Be Published When Available"],
  ];
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([t, s]) => (
        <div key={t} className="card">
          <p className="font-semibold">{t}</p>
          <p className="mt-2 text-sm text-muted">{s}</p>
        </div>
      ))}
    </div>
  );
}
