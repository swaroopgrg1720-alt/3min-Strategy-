import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Risk Disclosure",
  alternates: { canonical: "/risk-disclosure" },
  description: "Risk disclosure and important information for 3MIN SCALP, an automated Forex and CFD trading system.",
};

export default function Page() {
  return (
    <LegalPage title="Risk Disclosure & Important Information">
      <p>Please read this Risk Disclosure carefully before using 3MIN SCALP or placing any trades with an automated trading system. By using 3MIN SCALP, you acknowledge that you understand and accept the risks associated with automated Forex and CFD trading.</p>

      <h2>1. Substantial risk of loss</h2>
      <p>Forex and CFD trading involves a high level of risk and may not be suitable for all individuals. Trading with leverage can significantly increase both potential profits and potential losses. You may lose some or all of the funds allocated to trading.</p>

      <h2>2. Automated trading does not eliminate risk</h2>
      <p>3MIN SCALP is an automated trading system. Automation does not eliminate market, execution, technical, or financial risk.</p>
      <p>An Expert Advisor (EA) may experience losses due to adverse market movements, unexpected volatility, technical failures, incorrect settings, connectivity issues, or other circumstances beyond the control of the developer.</p>

      <h2>3. No guarantee of profit</h2>
      <p>3MIN SCALP does not guarantee profits, trading success, or protection against losses.</p>
      <p>Any examples, results, backtests, screenshots, statistics, or historical performance presented on this website are provided for informational purposes only and should not be interpreted as a guarantee of future results.</p>
      <p>Past performance is not indicative of future performance. Market conditions can change, and a strategy that performed well under historical conditions may perform differently in live markets.</p>

      <h2>4. Market &amp; execution conditions</h2>
      <p>Actual trading results may differ significantly from backtested, simulated, or advertised results.</p>
      <p>Factors that may affect performance include, but are not limited to:</p>
      <ul>
        <li>Spread and spread widening</li>
        <li>Commissions and trading costs</li>
        <li>Slippage</li>
        <li>Market liquidity</li>
        <li>Execution speed and latency</li>
        <li>Broker pricing and execution conditions</li>
        <li>Swap and overnight costs</li>
        <li>Volatility and market gaps</li>
        <li>News and economic events</li>
        <li>Internet or server connectivity</li>
        <li>Trading-platform or broker outages</li>
      </ul>
      <p>These factors can be particularly important for short-term and scalping strategies. Even relatively small changes in execution conditions can materially affect trading results.</p>

      <h2>5. Technical &amp; operational risk</h2>
      <p>Automated trading depends on technology and infrastructure. Hardware failures, software errors, internet interruptions, VPS problems, platform issues, broker-server problems, or other technical failures may prevent trades from being opened, modified, or closed as intended.</p>
      <p>Users are responsible for ensuring that their trading environment is appropriately configured and monitored.</p>

      <h2>6. Demo testing is strongly recommended</h2>
      <p>Before using 3MIN SCALP with real funds, users should thoroughly test the system on a demo account under conditions that are as close as possible to their intended live trading environment.</p>
      <p>Users should evaluate the EA&apos;s behaviour, broker execution, spreads, commissions, slippage, drawdown, and overall performance before considering live deployment.</p>

      <h2>7. Risk only capital you can afford to lose</h2>
      <p>You should never trade with money that you cannot afford to lose.</p>
      <p>Do not use borrowed money, emergency funds, essential living expenses, or money required for financial obligations to trade.</p>
      <p>Your individual financial circumstances, experience, objectives, and risk tolerance should be considered before engaging in leveraged trading.</p>

      <h2>8. User responsibility</h2>
      <p>The user is solely responsible for all trading decisions and for determining whether 3MIN SCALP is appropriate for their circumstances.</p>
      <p>The developer of 3MIN SCALP is not responsible for losses resulting from market movements, broker conditions, execution differences, technical problems, user configuration, improper use of the software, or other circumstances beyond the developer&apos;s reasonable control.</p>

      <h2>9. No financial advice</h2>
      <p>Nothing on this website, including information about 3MIN SCALP, trading strategies, examples, performance data, or educational materials, constitutes financial, investment, legal, or tax advice.</p>
      <p>3MIN SCALP is a software tool and should not be considered a recommendation to buy, sell, or trade any financial instrument.</p>
      <p>If you are uncertain about the risks involved, you should seek independent advice from an appropriately qualified financial professional before trading.</p>

      <h2>10. Acceptance of risk</h2>
      <p>By purchasing, downloading, installing, or using 3MIN SCALP, you acknowledge that you have read and understood this Risk Disclosure and that you accept the risks associated with automated Forex and CFD trading.</p>
      <p><strong>Trade responsibly. No trading system can eliminate market risk or guarantee future results.</strong></p>
    </LegalPage>
  );
}
