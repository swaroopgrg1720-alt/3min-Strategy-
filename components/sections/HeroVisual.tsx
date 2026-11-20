import Link from "next/link";

/**
 * A SIMULATION, not account data. It replays a fixed, shuffled sequence of 50 trades built from the two
 * figures stated by the developer: 66% wins (33 of 50), each win +2R and each loss -1R (1:2 risk-reward).
 * The order is deterministic, so the picture is identical on every load. No profit amounts are shown.
 */
const WINS = 33, TRADES = 50, WIN_R = 2, LOSS_R = -1;

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function simulate() {
  const rnd = mulberry32(3);
  const seq = Array.from({ length: TRADES }, (_, i) => i < WINS);
  for (let i = seq.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [seq[i], seq[j]] = [seq[j], seq[i]]; }
  let eq = 0;
  return [{ win: true, eq: 0 }, ...seq.map((win) => ({ win, eq: (eq += win ? WIN_R : LOSS_R) }))];
}

const W = 360, H = 180, PX = 10, PT = 14, PB = 14;
const pts = simulate();
const lo = Math.min(...pts.map((p) => p.eq)), hi = Math.max(...pts.map((p) => p.eq));
const x = (i: number) => PX + (i / (pts.length - 1)) * (W - PX * 2);
const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);
const LINE = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.eq).toFixed(1)}`).join(" ");
const ZERO = y(0).toFixed(1);

const R = 26, C = 2 * Math.PI * R;

export function HeroVisual() {
  return (
    <figure className="relative" aria-label="Illustration: a simulated sequence of 50 trades at a 66 percent win rate and a 1 to 2 risk-reward ratio. Not actual results.">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="overflow-hidden rounded-3xl border border-line bg-bg2 shadow-glow">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-sm.png" width={28} height={28} alt="" aria-hidden="true" />
            <div className="min-w-0"><p className="truncate font-display text-[15px] font-semibold leading-tight">3MIN SCALP</p><p className="text-xs text-muted">Strategy overview</p></div>
          </div>
          <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">Illustration</span>
        </div>

        <div className="grid grid-cols-3 gap-px bg-line">
          <div className="flex flex-col items-center bg-bg2 px-2 py-4 text-center">
            <div className="relative h-[64px] w-[64px]">
              <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
                <circle cx="32" cy="32" r={R} fill="none" stroke="#2A352E" strokeWidth="6" />
                <circle cx="32" cy="32" r={R} fill="none" stroke="#00E59B" strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - 0.66)} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold">66%</span>
            </div>
            <p className="mt-2 text-xs text-muted">Average win rate</p>
          </div>
          <div className="flex flex-col items-center justify-between bg-bg2 px-2 py-4 text-center">
            <p className="font-display text-3xl font-bold leading-[64px]">1:2</p>
            <div className="w-full" aria-hidden="true">
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full"><span className="flex-1 bg-red-400" /><span className="flex-[2] bg-accent" /></div>
            </div>
            <p className="mt-2 text-xs text-muted">Risk-reward</p>
          </div>
          <div className="flex flex-col items-center justify-between bg-bg2 px-2 py-4 text-center">
            <p className="font-display text-3xl font-bold leading-[64px]">33%</p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line" aria-hidden="true"><div className="h-full w-1/3 rounded-full bg-amber-300" /></div>
            <p className="mt-2 text-xs text-muted">Break-even win rate at 1:2</p>
          </div>
        </div>

        <div className="border-t border-line px-4 pb-4 pt-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">Simulated sequence of 50 trades</p>
            <p className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" />Win +2R</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Loss −1R</span>
            </p>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Simulated equity curve rising overall, with losing trades and dips along the way">
            <defs>
              <linearGradient id="hv-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00E59B" stopOpacity="0.25" /><stop offset="1" stopColor="#00E59B" stopOpacity="0" /></linearGradient>
              <linearGradient id="hv-line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#00B77A" /><stop offset="1" stopColor="#5CF2BE" /></linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={PX} x2={W - PX} y1={PT + f * (H - PT - PB)} y2={PT + f * (H - PT - PB)} stroke="#2A352E" strokeOpacity="0.7" />)}
            <line x1={PX} x2={W - PX} y1={ZERO} y2={ZERO} stroke="#AEB8B0" strokeOpacity="0.45" strokeDasharray="4 5" />
            <path d={`${LINE} L${x(pts.length - 1).toFixed(1)} ${H - PB} L${PX} ${H - PB} Z`} fill="url(#hv-fill)" className="hv-area" />
            <path d={LINE} pathLength={1} fill="none" stroke="url(#hv-line)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" className="draw-line" />
            <g className="hv-area">
              {pts.slice(1).map((p, i) => <circle key={i} cx={x(i + 1)} cy={y(p.eq)} r="2" fill={p.win ? "#00E59B" : "#F87171"} />)}
            </g>
            <g className="hv-dot">
              <circle r="10" fill="#00E59B" fillOpacity="0.2"><animate attributeName="r" values="7;12;7" dur="2.4s" repeatCount="indefinite" /></circle>
              <circle r="4.5" fill="#fff" />
              <animateMotion dur="9s" repeatCount="indefinite" path={LINE} keyPoints="0;1;1" keyTimes="0;0.88;1" calcMode="linear" />
            </g>
            <text x={PX} y={H - 2} fontSize="9" fill="#AEB8B0">Trade 1</text>
            <text x={W - PX} y={H - 2} fontSize="9" fill="#AEB8B0" textAnchor="end">Trade 50</text>
          </svg>
        </div>

        <ul className="flex flex-wrap gap-2 border-t border-line px-4 py-3 text-xs text-muted">
          {["MetaTrader 5", "3-minute chart", "EURUSD", "GBPUSD", "XAUUSD"].map((t) => <li key={t} className="rounded-full border border-line bg-bg px-3 py-1">{t}</li>)}
        </ul>
      </div>
      <figcaption className="mt-3 text-center text-sm leading-relaxed text-amber-300/90">
        Illustration only, not actual account results. It replays 50 simulated trades built from the developer&apos;s own figures (66% wins, +2R per win, −1R per loss), which are not independently verified. A historical win rate does not guarantee future profit.{" "}
        <Link href="/risk-disclosure" className="underline">Read the Risk Disclosure</Link>
      </figcaption>
    </figure>
  );
}
