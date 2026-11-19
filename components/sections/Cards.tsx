import type { ReactNode } from "react";
import { IconBook, IconBolt, IconBox, IconChart, IconKey, IconLayers, IconSupport } from "@/components/ui/Icons";

export function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <article className="card card-hover" data-reveal>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-forest/40 text-accent">{icon}</div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </article>
  );
}

export const overviewCards = [
  { icon: <IconChart />, title: "MetaTrader 5", text: "Built for the MT5 trading environment." },
  { icon: <IconLayers />, title: "Multi-Pair", text: "Supports EURUSD, GBPUSD and XAUUSD." },
  { icon: <IconBolt />, title: "Automated", text: "Designed to automate trading according to its programmed logic." },
  { icon: <IconBox />, title: "EX5 Distribution", text: "Distributed as a compiled EX5 file." },
  { icon: <IconKey />, title: "Flexible Licensing", text: "Monthly and lifetime options." },
  { icon: <IconBook />, title: "Simple Setup", text: "Clear installation and setup instructions." },
];

export const featureCards = [
  { icon: <IconChart />, title: "MetaTrader 5", text: "Designed for MT5." },
  { icon: <IconLayers />, title: "Multi-Pair Support", text: "EURUSD, GBPUSD and XAUUSD." },
  { icon: <IconBolt />, title: "Automated Execution", text: "Automates trading according to programmed EA logic." },
  { icon: <IconBox />, title: "Compiled EX5", text: "Professional compiled distribution." },
  { icon: <IconKey />, title: "Flexible Licensing", text: "Monthly and lifetime options." },
  { icon: <IconBook />, title: "Documentation", text: "Installation and setup guidance." },
  { icon: <IconSupport />, title: "Customer Support", text: "Dedicated support interface." },
];

export function CardGrid({ items }: { items: { icon: ReactNode; title: string; text: string }[] }) {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (<FeatureCard key={c.title} {...c} />))}
    </div>
  );
}

const markets = [
  { symbol: "EURUSD", desc: "Major forex market.", path: "M0 40 L20 32 L40 38 L60 22 L80 28 L100 12" },
  { symbol: "GBPUSD", desc: "Major forex market.", path: "M0 30 L20 36 L40 20 L60 26 L80 14 L100 22" },
  { symbol: "XAUUSD", desc: "Gold / US Dollar.", path: "M0 42 L20 30 L40 34 L60 16 L80 24 L100 8" },
];

export function MarketCards() {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-3">
      {markets.map((m) => (
        <article key={m.symbol} className="card card-hover" data-reveal>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-wide">{m.symbol}</h3>
            <span className="rounded-md border border-line px-2 py-0.5 text-xs font-semibold tracking-wider text-muted">SUPPORTED</span>
          </div>
          <p className="mt-2 text-sm text-muted">{m.desc}</p>
          <svg viewBox="0 0 100 50" className="mt-6 h-24 w-full" role="img" aria-label={`Decorative ${m.symbol} graphic, not real price data`}>
            <path d={m.path} fill="none" stroke="#00E59B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            <path d={`${m.path} L100 50 L0 50 Z`} fill="url(#mk)" opacity="0.25" />
            <defs><linearGradient id="mk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00E59B" /><stop offset="1" stopColor="#00E59B" stopOpacity="0" /></linearGradient></defs>
          </svg>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted/80">Decorative graphic — not price data</p>
        </article>
      ))}
    </div>
  );
}

const steps = [
  { n: "01", title: "Choose Your License", text: "Select monthly or lifetime access." },
  { n: "02", title: "Complete Crypto Payment", text: "Pay securely using supported cryptocurrency." },
  { n: "03", title: "Receive Access", text: "Receive your license and product access." },
  { n: "04", title: "Install on MT5", text: "Install the EX5 file and configure the EA." },
];

export function HowItWorks() {
  return (
    <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s) => (
        <li key={s.n} className="card relative" data-reveal>
          <span className="text-4xl font-bold text-forest">{s.n}</span>
          <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
