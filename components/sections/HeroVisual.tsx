import Link from "next/link";

/**
 * An illustrative rising curve. It is a drawing, NOT account data or a backtest result,
 * and it is labelled that way. The two headline figures are the developer's own and are not independently verified.
 */
const LINE = "M8 176 C40 172 56 150 84 152 S120 132 146 120 S176 122 196 100 S236 86 258 62 S292 36 312 22";

export function HeroVisual() {
  return (
    <figure className="relative" aria-label="Illustration of a rising curve with an average win rate of 66 percent and a 1 to 2 risk-reward ratio. Illustration only, not actual results.">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" aria-hidden="true" />
      <div className="overflow-hidden rounded-3xl border border-line bg-bg2 shadow-glow">
        <div className="grid grid-cols-2 gap-px bg-line">
          <div className="bg-bg2 p-5">
            <p className="text-sm text-muted">Average win rate</p>
            <p className="mt-1 font-display text-4xl font-bold leading-none text-accent sm:text-5xl">66%</p>
          </div>
          <div className="bg-bg2 p-5">
            <p className="text-sm text-muted">Risk-reward</p>
            <p className="mt-1 font-display text-4xl font-bold leading-none sm:text-5xl">1:2</p>
          </div>
        </div>

        <div className="relative px-2 pt-4">
          <span className="absolute right-4 top-3 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">Illustration</span>
          <svg viewBox="0 0 320 200" className="w-full" role="img" aria-label="Illustrative curve rising from left to right">
            <defs>
              <linearGradient id="hv-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#00E59B" stopOpacity="0.28" />
                <stop offset="1" stopColor="#00E59B" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hv-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#00B77A" />
                <stop offset="1" stopColor="#5CF2BE" />
              </linearGradient>
            </defs>
            {[50, 100, 150].map((y) => <line key={y} x1="0" x2="320" y1={y} y2={y} stroke="#2A352E" strokeOpacity="0.7" strokeDasharray="3 6" />)}
            <path d={`${LINE} L312 200 L8 200 Z`} fill="url(#hv-fill)" className="hv-area" />
            <path d={LINE} pathLength={1} fill="none" stroke="url(#hv-line)" strokeWidth="3.5" strokeLinecap="round" className="draw-line" />
            <g className="hv-dot">
              <circle r="11" fill="#00E59B" fillOpacity="0.2"><animate attributeName="r" values="8;13;8" dur="2.4s" repeatCount="indefinite" /></circle>
              <circle r="5" fill="#00E59B" />
              <animateMotion dur="7s" repeatCount="indefinite" path={LINE} keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear" />
            </g>
          </svg>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm leading-relaxed text-amber-300/90">
        Illustration only, not actual account results. Figures are the developer&apos;s own and not independently verified. A historical win rate does not guarantee future profit.{" "}
        <Link href="/risk-disclosure" className="underline">Read the Risk Disclosure</Link>
      </figcaption>
    </figure>
  );
}
