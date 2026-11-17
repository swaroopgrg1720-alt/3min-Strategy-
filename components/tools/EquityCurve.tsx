import type { Stats } from "@/lib/tools/stats";

export function EquityCurve({ curve }: { curve: Stats["curve"] }) {
  if (curve.length < 2) return <p className="py-10 text-center text-sm text-muted">Log at least two trades to see your equity curve.</p>;
  const W = 640, H = 220, P = 28;
  const ys = [0, ...curve.map((c) => c.equity)];
  const min = Math.min(...ys), max = Math.max(...ys), span = max - min || 1;
  const x = (i: number) => P + (i / (curve.length - 1)) * (W - P * 2);
  const y = (v: number) => H - P - ((v - min) / span) * (H - P * 2);
  const pts = curve.map((c, i) => `${x(i).toFixed(1)},${y(c.equity).toFixed(1)}`).join(" ");
  const zero = y(0);
  const last = curve[curve.length - 1].equity;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Equity curve of cumulative profit and loss, ending at ${last}`} className="h-auto w-full">
      <line x1={P} x2={W - P} y1={zero} y2={zero} stroke="#1B2A2A" strokeDasharray="4 4" />
      <polyline points={`${x(0)},${zero} ${pts} ${x(curve.length - 1)},${zero}`} fill="rgba(0,229,155,0.08)" stroke="none" />
      <polyline points={pts} fill="none" stroke="#00E59B" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <text x={P} y={14} fill="#89949F" fontSize="11">{max.toFixed(0)}</text>
      <text x={P} y={H - 8} fill="#89949F" fontSize="11">{min.toFixed(0)}</text>
      <text x={W - P} y={14} fill="#89949F" fontSize="11" textAnchor="end">{curve.length} trades</text>
    </svg>
  );
}
