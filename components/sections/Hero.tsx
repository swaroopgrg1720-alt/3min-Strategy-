import Link from "next/link";
import { HeroVisual } from "./HeroVisual";

const trust = ["MetaTrader 5", "Multi-pair EA", "EURUSD", "GBPUSD", "XAUUSD", "Monthly or lifetime"];

export function Hero() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,rgba(29,70,54,0.6),transparent)]" aria-hidden="true" />
        <div className="container-x grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div data-reveal>
            <p className="eyebrow">MetaTrader 5 Expert Advisor</p>
            <h1 className="mt-5 text-[2.6rem] font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Automated trading with smarter execution.
            </h1>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted sm:text-lg">
              3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pricing" className="btn btn-primary">Get 3MIN SCALP</Link>
              <Link href="/features" className="btn btn-ghost">Explore Features</Link>
            </div>
            <p className="mt-5 text-sm text-muted">Trading involves risk. No profits are guaranteed. Demo testing is recommended.</p>
          </div>
          <div data-reveal style={{ animationDelay: "0.15s" }}>
            <HeroVisual />
          </div>
        </div>
      </section>
      <section aria-label="Product facts" className="border-y border-line bg-bg2/50">
        <ul className="container-x flex flex-wrap items-center justify-center gap-2.5 py-6 text-sm text-ink">
          {trust.map((t) => (<li key={t} className="whitespace-nowrap rounded-full border border-line bg-bg px-4 py-1.5">{t}</li>))}
        </ul>
      </section>
    </>
  );
}
