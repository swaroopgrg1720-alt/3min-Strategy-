import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = { title: "Risk Disclosure", alternates: { canonical: "/risk-disclosure" }, description: "Risk disclosure for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Risk Disclosure">
      <p>Please read this page carefully before using 3MIN SCALP or trading with any automated system.</p>
      <h2>Substantial risk</h2>
      <p>Forex and CFD trading involves substantial risk and may not be suitable for everyone.</p>
      <h2>Automation does not remove risk</h2>
      <p>Automated trading does not eliminate market risk. An Expert Advisor can experience losses.</p>
      <h2>Past performance</h2>
      <p>Past performance does not guarantee future results. Market conditions can change.</p>
      <h2>Trading conditions</h2>
      <p>Spreads, commissions, slippage, latency and broker conditions can affect results.</p>
      <h2>Only risk what you can afford to lose</h2>
      <p>Users should only trade with money they can afford to lose.</p>
      <h2>Test first</h2>
      <p>Demo testing is strongly recommended before using real funds.</p>
      <h2>No guarantees</h2>
      <p>3MIN SCALP does not guarantee profits or protection from losses. Nothing on this website is financial advice.</p>
    </LegalPage>
  );
}
