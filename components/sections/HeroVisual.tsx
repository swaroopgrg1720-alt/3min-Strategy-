import { DemoBadge } from "@/components/ui/DemoBadge";

/** Static, hand-drawn candles. A design visualization only — not market data or performance. */
const candles = [
  [30, 150, 120, 140, 1], [52, 140, 110, 125, 0], [74, 130, 100, 115, 1], [96, 120, 95, 105, 1],
  [118, 125, 98, 118, 0], [140, 112, 85, 92, 1], [162, 100, 78, 95, 0], [184, 98, 70, 80, 1],
  [206, 88, 62, 70, 1], [228, 78, 55, 72, 0], [250, 74, 48, 56, 1], [272, 62, 40, 50, 1],
] as const;

export function HeroVisual() {
  return (
    <figure className="relative" aria-label="Illustration of a trading interface. Design visualization only.">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="overflow-hidden rounded-2xl border border-line bg-bg2 shadow-glow">
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" /><span className="h-2.5 w-2.5 rounded-full bg-line" />
          </div>
          <span className="text-[11px] font-semibold tracking-wider text-muted">MT5-STYLE INTERFACE · CONCEPT</span>
          <DemoBadge />
        </div>
        <div className="flex gap-1 border-b border-line px-3 py-2 text-xs font-semibold">
          <span className="rounded-md bg-forest/60 px-2.5 py-1 text-accent">EURUSD</span>
          <span className="rounded-md px-2.5 py-1 text-muted">GBPUSD</span>
          <span className="rounded-md px-2.5 py-1 text-muted">XAUUSD</span>
          <span className="ml-auto rounded-md px-2.5 py-1 text-muted">M3</span>
        </div>
        <svg viewBox="0 0 320 190" className="w-full" role="img" aria-label="Concept candlestick chart with buy and sell markers">
          {[40, 80, 120, 160].map((y) => (<line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#1B2A2A" strokeWidth="1" />))}
          {candles.map(([x, hi, lo, close, up], i) => {
            const top = Math.min(hi, lo) + 0;
            const color = up ? "#00E59B" : "#F0616D";
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={hi + 18} y2={lo - 8} stroke={color} strokeWidth="1.5" />
                <rect x={x - 5} y={Math.min(close, hi) + 5} width="10" height={Math.max(10, Math.abs(hi - close) + 8)} rx="1.5" fill={color} opacity={up ? 0.9 : 0.75} />
                <title>{`candle ${i + 1} ${top}`}</title>
              </g>
            );
          })}
          <g aria-label="Buy marker"><path d="M96 150 l6 -10 l6 10 z" fill="#00E59B" /><text x="102" y="164" textAnchor="middle" fontSize="8" fill="#00E59B">BUY</text></g>
          <g aria-label="Sell marker"><path d="M228 26 l6 10 l6 -10 z" fill="#F0616D" /><text x="234" y="20" textAnchor="middle" fontSize="8" fill="#F0616D">SELL</text></g>
        </svg>
        <div className="grid grid-cols-3 gap-px border-t border-line bg-line text-center text-[11px]">
          <div className="bg-bg2 px-2 py-3"><p className="text-muted">Algo Trading</p><p className="mt-0.5 font-semibold text-accent">ENABLED</p></div>
          <div className="bg-bg2 px-2 py-3"><p className="text-muted">Mode</p><p className="mt-0.5 font-semibold text-ink">Concept</p></div>
          <div className="bg-bg2 px-2 py-3"><p className="text-muted">Platform</p><p className="mt-0.5 font-semibold text-ink">MT5</p></div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] font-semibold uppercase tracking-wider text-amber-300/90">
        Design visualization — not historical or verified performance
      </figcaption>
    </figure>
  );
}
