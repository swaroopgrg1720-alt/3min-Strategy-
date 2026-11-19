import type { Stats } from "@/lib/tools/stats";

export function EquityCurve({ curve }: { curve: Stats["curve"] }) {
  if (curve.length < 2) return <p className="py-12 text-center text-sm text-muted">Log at least two trades to see your equity curve.</p>;
  const W = 640, H = 240, PX = 14, PT = 20, PB = 26;
  const ys = [0, ...curve.map((c) => c.equity)];
  const min = Math.min(...ys), max = Math.max(...ys), span = max - min || 1;
  const x = (i: number) => PX + (i / (curve.length - 1)) * (W - PX * 2);
  const y = (v: number) => PT + (1 - (v - min) / span) * (H - PT - PB);
  const pts = curve.map((c, i) => `${x(i).toFixed(1)},${y(c.equity).toFixed(1)}`).join(" ");
  const zero = y(0);
  const last = curve[curve.length - 1].equity;
  const up = last >= 0;
  const color = up ? "#00E59B" : "#F87171";
  const lx = x(curve.length - 1), ly = y(last);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Equity curve of cumulative profit and loss, ending at ${last.toFixed(2)}`} className="h-auto w-full">
      <defs>
        <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={PX} x2={W - PX} y1={PT + f * (H - PT - PB)} y2={PT + f * (H - PT - PB)} stroke="#2A352E" strokeOpacity="0.6" />)}
      <line x1={PX} x2={W - PX} y1={zero} y2={zero} stroke="#AEB8B0" strokeOpacity="0.5" strokeDasharray="4 5" />
      <polygon points={`${x(0)},${zero} ${pts} ${lx},${zero}`} fill="url(#eq-fill)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="9" fill={color} fillOpacity="0.18" />
      <circle cx={lx} cy={ly} r="4.5" fill={color} />
      <text x={PX} y={12} fill="#AEB8B0" fontSize="11">{max.toFixed(0)}</text>
      <text x={PX} y={H - 8} fill="#AEB8B0" fontSize="11">{min.toFixed(0)}</text>
      <text x={W - PX} y={H - 8} fill="#AEB8B0" fontSize="11" textAnchor="end">{curve.length} trades</text>
    </svg>
  );
}
