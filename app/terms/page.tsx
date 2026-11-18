import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" }, description: "Terms of service for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Terms of Service">
      <ul>
        <li>Business legal name: <Placeholder>{legal.businessName}</Placeholder></li>
        <li>Business address: <Placeholder>{legal.businessAddress}</Placeholder></li>
        <li>Business email: <Placeholder>{legal.email}</Placeholder></li>
        <li>Effective date: <Placeholder>{legal.effectiveDate}</Placeholder></li>
      </ul>
      <h2>1. Product usage</h2>
      <p>3MIN SCALP is a MetaTrader 5 Expert Advisor distributed as a compiled EX5 file. You are responsible for how you configure and operate it, and for your trading decisions. Demo testing is strongly recommended.</p>
      <h2>2. License restrictions</h2>
      <p>A license grants you a limited, non-exclusive, non-transferable right to use the product under the plan you purchased (monthly or lifetime). The scope of the license is as follows:</p>
      <ul>
        <li><strong>One account per license:</strong> each license key may be used on one MetaTrader 5 account number only. The key is bound to the first account number you enter when you activate it. If you need to use a different account, contact support.</li>
        <li><strong>Personal use:</strong> the license is for your own use. You may not share your license key or allow others to use it.</li>
        <li><strong>Monthly licenses:</strong> access lasts for the period you paid for and ends at expiration unless renewed. After a renewal you may receive a new license key, which you can copy from your customer area.</li>
        <li><strong>Lifetime licenses:</strong> a lifetime license does not expire and does not require recurring payments, subject to these terms.</li>
        <li><strong>Additional accounts:</strong> to use the product on more than one MetaTrader 5 account, a separate license is required for each account.</li>
        <li><strong>Misuse:</strong> using a key on an account it is not bound to, or attempting to bypass the license check, is a breach of these terms and may result in suspension or termination of the license.</li>
      </ul>
      <h2>3. Prohibited redistribution</h2>
      <p>You may not copy, resell, share, sublicense, publish or otherwise redistribute the product or your access to it, and may not attempt to reverse engineer or circumvent licensing.</p>
      <h2>4. Intellectual property</h2>
      <p>The product, brand and website content remain the property of <Placeholder>{legal.businessName}</Placeholder>.</p>
      <h2>5. Payments</h2>
      <p>Payments are accepted in cryptocurrency only. Orders are fulfilled after payment is confirmed server-side. Pricing may change.</p>
      <h2>6. Refunds</h2>
      <p>All purchases are final and non-refundable. See the <a className="text-accent underline" href="/refund-policy">No Refund Policy</a>.</p>
      <h2>7. Disclaimers</h2>
      <p>The product is provided “as is”. We do not guarantee profits, performance, uninterrupted operation or compatibility with every broker. See the <a className="text-accent underline" href="/risk-disclosure">Risk Disclosure</a>.</p>
      <h2>8. Limitation of liability</h2>
      <p>The EA (Expert Advisor) is provided strictly as a trading automation tool for informational and technical purposes. We do not provide financial, investment, or trading advice, and the EA should not be considered a recommendation to buy, sell, or hold any financial instrument.</p>
      <p>By using our EA, you acknowledge and agree that:</p>
      <ol className="list-decimal pl-6">
        <li><strong>No financial responsibility:</strong> All trading and investment decisions are made entirely at your own discretion and risk. We are not responsible for any financial decisions made by users.</li>
        <li><strong>No profit guarantee:</strong> We do not guarantee profits, consistent returns, or any specific trading performance. Trading involves substantial financial risk, including the possibility of losing some or all of your invested capital.</li>
        <li><strong>No liability for trading losses:</strong> We shall not be held liable for any direct or indirect financial losses, lost profits, account drawdowns, margin calls, liquidations, or other damages resulting from the use or inability to use the EA.</li>
        <li><strong>Market and broker conditions:</strong> We are not responsible for losses caused by market volatility, slippage, spreads, requotes, execution delays, broker policies, platform failures, internet connectivity issues, or VPS interruptions.</li>
        <li><strong>User responsibility:</strong> Users are solely responsible for configuring the EA, selecting risk parameters, choosing a broker, monitoring trading activity, and ensuring that its use complies with applicable laws and regulations.</li>
        <li><strong>Technical interruptions:</strong> We are not responsible for technical errors, software incompatibilities, bugs, connectivity failures, or unexpected platform behaviour that may affect automated trading.</li>
        <li><strong>Use at your own risk:</strong> By purchasing or using the EA, you acknowledge that you understand the risks associated with automated trading and accept full responsibility for all trading activities and outcomes.</li>
      </ol>
      <p>To the maximum extent permitted by applicable law, we disclaim liability for any damages, losses, or claims arising from the use of our EA.</p>
      <p><strong>Important notice:</strong> Past performance, backtesting results, and simulated trading results do not guarantee future performance. Always test the EA on a demo account before using it with real funds.</p>
      <p>By purchasing, downloading, or using our EA, you acknowledge that you have read, understood, and agreed to this Limitation of Liability.</p>
      <h2>9. Termination</h2>
      <p>We may suspend or terminate a license for breach of these terms. Monthly licenses end at expiration unless renewed.</p>
    </LegalPage>
  );
}
