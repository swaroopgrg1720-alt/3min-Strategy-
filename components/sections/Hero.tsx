import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

const trust = ["METATRADER 5", "MULTI-PAIR EA", "EURUSD", "GBPUSD", "XAUUSD", "MONTHLY + LIFETIME"];

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,rgba(18,61,50,0.55),transparent)]" aria-hidden="true" />
        <div className="container-x grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div data-reveal>
            <p className="eyebrow">MetaTrader 5 Expert Advisor</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Automated Trading. <span className="gradient-text animate-drift">Smarter Execution.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing" className="btn btn-primary">Get 3MIN SCALP</Link>
              <Link href="/features" className="btn btn-ghost">Explore Features</Link>
            </div>
            <p className="mt-5 text-xs text-muted">Trading involves risk. No profits are guaranteed. Demo testing is recommended.</p>
          </div>
          <div data-reveal style={{ animationDelay: "0.15s" }}>
            <HeroVisual />
          </div>
        </div>
      </section>
      <section aria-label="Product facts" className="border-y border-line bg-bg2/50">
        <ul className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-xs font-semibold tracking-[0.18em] text-muted">
          {trust.map((t) => (<li key={t} className="whitespace-nowrap">{t}</li>))}
        </ul>
      </section>
    </>
  );
}
