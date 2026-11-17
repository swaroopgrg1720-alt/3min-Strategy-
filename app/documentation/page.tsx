import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Documentation", alternates: { canonical: "/documentation" }, description: "Install and set up 3MIN SCALP on MetaTrader 5." };

const steps = [
  "Open MetaTrader 5.", "Open File.", "Select Open Data Folder.", "Open MQL5.", "Open Experts.",
  "Place the EX5 file inside the Experts folder.", "Restart MT5 or refresh Navigator.", "Find 3MIN SCALP.",
  "Attach it to the supported chart.", "Configure available settings.", "Enable Algo Trading where required.", "Monitor the EA.",
];

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Documentation" title="Installation & setup" />
      <section className="section"><div className="container-x max-w-3xl prose-legal">
        <h2 className="!mt-0">Installation</h2>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-4 rounded-xl border border-line bg-bg2/60 p-4 !mt-3">
              <span className="font-mono text-accent">{String(i + 1).padStart(2, "0")}</span><span className="text-ink/90">{s}</span>
            </li>
          ))}
        </ol>
        <h2>Settings</h2>
        <p>Available settings depend on the current EA version.</p>
        <h2>Supported charts</h2>
        <p>3MIN SCALP supports EURUSD, GBPUSD and XAUUSD on MetaTrader 5.</p>
        <h2>Test on a demo account first</h2>
        <p>We strongly recommend testing on a demo account before using real funds. Broker conditions can affect results, including:</p>
        <ul><li>Spread</li><li>Slippage</li><li>Execution</li><li>Commission</li><li>Liquidity</li><li>Trading conditions</li></ul>
        <h2>VPS</h2>
        <p>A VPS can be useful for continuous automated operation, but requirements depend on your setup.</p>
        <p className="mt-8 rounded-xl border border-line bg-bg2/60 p-4 text-sm">Trading involves substantial risk. See the <a className="text-accent underline" href="/risk-disclosure">Risk Disclosure</a>.</p>
      </div></section>
    </>
  );
}
