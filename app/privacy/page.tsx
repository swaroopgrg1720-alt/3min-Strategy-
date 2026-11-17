import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" }, description: "Privacy policy for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This is a template to be reviewed by a qualified professional. It does not claim compliance with any specific law.</p>
      <p>Effective date: <Placeholder>{legal.effectiveDate}</Placeholder></p>
      <h2>Information collected</h2>
      <p>Information you provide (name, email, messages), order details, and technical data such as device and usage information.</p>
      <h2>Customer accounts</h2>
      <p>If you create an account we store your email and licensing details needed to provide access.</p>
      <h2>Email</h2>
      <p>We use your email for order confirmations, license and download notices, and support replies.</p>
      <h2>Payment processing</h2>
      <p>Payments are made in cryptocurrency. Blockchain transactions are public by nature. Payment verification is handled server-side, with a payment provider if configured: <Placeholder>[PAYMENT PROVIDER]</Placeholder>. We never ask for your private keys.</p>
      <h2>Cookies</h2>
      <p>Essential cookies are always used. Analytics and marketing cookies are only used if you accept them in the cookie banner.</p>
      <h2>Analytics</h2>
      <p>If enabled and accepted, analytics tools such as <Placeholder>[ANALYTICS PROVIDERS]</Placeholder> may be used.</p>
      <h2>Support information</h2>
      <p>Messages and tickets you send are stored to respond to you and improve support.</p>
      <h2>Data retention</h2>
      <p><Placeholder>[INSERT RETENTION PERIODS]</Placeholder></p>
      <h2>Security</h2>
      <p>We use reasonable technical measures, but no system is completely secure.</p>
      <h2>Third-party services</h2>
      <p>Hosting, email, payment and analytics providers may process data on our behalf: <Placeholder>[LIST PROVIDERS]</Placeholder>.</p>
      <h2>Your rights</h2>
      <p>Depending on where you live, you may have rights to access, correct or delete your data. Contact us to make a request.</p>
      <h2>Contact</h2>
      <p><Placeholder>{legal.businessName}</Placeholder> · <Placeholder>{legal.email}</Placeholder></p>
    </LegalPage>
  );
}
