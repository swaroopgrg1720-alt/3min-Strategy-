/** Illustrative candlestick drawing. It is not real data and shows no signals. */
const C: [number, number, number, number][] = [[60,52,64,48],[52,46,56,42],[46,50,54,44],[50,40,52,38],[40,44,48,36],[44,34,46,32],[34,38,42,30],[38,28,40,26],[28,32,36,24],[32,24,34,20],[24,30,32,18],[30,20,32,16],[20,24,28,14],[24,16,26,12]];
export function ChartPreview() {
  return (
    <figure className="card !p-4 sm:!p-5">
      <svg viewBox="0 0 320 90" role="img" aria-label="Illustration of a candlestick chart" className="h-auto w-full">
        {[20, 45, 70].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#2A352E" strokeWidth="0.5" />)}
        {C.map(([o, c, h, l], i) => {
          const x = 14 + i * 22, up = c < o;
          return (
            <g key={i} className="candle" style={{ animationDelay: `${i * 70}ms` }}>
              <line x1={x} x2={x} y1={h} y2={l} stroke={up ? "#00E59B" : "#F4C57A"} strokeWidth="1" />
              <rect x={x - 5} y={Math.min(o, c)} width="10" height={Math.max(3, Math.abs(o - c))} rx="1" fill={up ? "#00E59B" : "#F4C57A"} opacity="0.9" />
            </g>
          );
        })}
        <polyline points="14,56 36,50 58,50 80,42 102,42 124,34 146,34 168,28 190,28 212,22 234,22 256,18 278,16 300,14" fill="none" stroke="#00E59B" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
      </svg>
      <figcaption className="mt-3 text-xs text-muted">Illustration only. It is not real market data and not a trading signal.</figcaption>
    </figure>
  );
}
