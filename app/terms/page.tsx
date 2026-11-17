import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Terms of Service", alternates: { canonical: "/terms" }, description: "Terms of service for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms are a template. Have them reviewed by a qualified lawyer before launch. Bracketed items must be completed.
      </p>
      <ul>
        <li>Business legal name: <Placeholder>{legal.businessName}</Placeholder></li>
        <li>Business address: <Placeholder>{legal.businessAddress}</Placeholder></li>
        <li>Business email: <Placeholder>{legal.email}</Placeholder></li>
        <li>Effective date: <Placeholder>{legal.effectiveDate}</Placeholder></li>
      </ul>
      <h2>1. Product usage</h2>
      <p>3MIN SCALP is a MetaTrader 5 Expert Advisor distributed as a compiled EX5 file. You are responsible for how you configure and operate it, and for your trading decisions. Demo testing is strongly recommended.</p>
      <h2>2. License restrictions</h2>
      <p>A license grants you a limited, non-exclusive, non-transferable right to use the product under the plan you purchased (monthly or lifetime). <Placeholder>[INSERT LICENSE SCOPE, E.G. NUMBER OF ACCOUNTS]</Placeholder></p>
      <h2>3. Prohibited redistribution</h2>
      <p>You may not copy, resell, share, sublicense, publish or otherwise redistribute the product or your access to it, and may not attempt to reverse engineer or circumvent licensing.</p>
      <h2>4. Intellectual property</h2>
      <p>The product, brand and website content remain the property of <Placeholder>{legal.businessName}</Placeholder>.</p>
      <h2>5. Payments</h2>
      <p>Payments are accepted in cryptocurrency only. Orders are fulfilled after payment is confirmed server-side. Pricing may change.</p>
      <h2>6. Refunds</h2>
      <p>See the <a className="text-accent underline" href="/refund-policy">Refund Policy</a>.</p>
      <h2>7. Disclaimers</h2>
      <p>The product is provided “as is”. We do not guarantee profits, performance, uninterrupted operation or compatibility with every broker. See the <a className="text-accent underline" href="/risk-disclosure">Risk Disclosure</a>.</p>
      <h2>8. Limitation of liability</h2>
      <p><Placeholder>[INSERT LIMITATION OF LIABILITY CLAUSE REVIEWED BY COUNSEL]</Placeholder></p>
      <h2>9. Termination</h2>
      <p>We may suspend or terminate a license for breach of these terms. Monthly licenses end at expiration unless renewed.</p>
    </LegalPage>
  );
}
