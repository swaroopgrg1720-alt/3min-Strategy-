import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" }, description: "Privacy policy for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Privacy Policy">
      <p>Effective date: <Placeholder>{legal.effectiveDate}</Placeholder></p>
      <h2>Information collected</h2>
      <p>Information you provide (name, email, messages), order details, and technical data such as device and usage information.</p>
      <h2>Customer accounts</h2>
      <p>If you create an account we store your email and licensing details needed to provide access.</p>
      <h2>Email</h2>
      <p>We use your email for order confirmations, license and download notices, and support replies.</p>
      <h2>Payment processing</h2>
      <p>Payments are made in cryptocurrency. Blockchain transactions are public by nature. Payment verification is handled server-side, through our payment provider, CryptoPayr. We never ask for your private keys.</p>
      <h2>Cookies and marketing</h2>
      <p>Essential cookies are always used. Marketing cookies are used only if you provide your consent through our website&apos;s cookie banner. You can manage or withdraw your cookie preferences at any time through the available cookie settings.</p>
      <h2>Analytics</h2>
      <p>If you consent to analytics cookies, we may use analytics tools to collect information about how visitors interact with our website. This information helps us understand website traffic, improve user experience, and enhance our services.</p>
      <h2>Support information</h2>
      <p>When you contact us through our website, email, or support channels, we may collect and store your messages, contact details, and support requests. This information is used solely to respond to your inquiries, provide technical assistance, resolve issues, and improve our customer support services.</p>
      <h2>Data retention</h2>
      <p>We retain personal information only for as long as necessary to fulfil the purposes described in this Privacy Policy, including providing our services, maintaining customer records, resolving disputes, and meeting applicable legal obligations.</p>
      <p>When personal information is no longer required, we take reasonable steps to securely delete or anonymize it.</p>
      <h2>Security</h2>
      <p>We implement reasonable technical and organizational security measures to protect your personal information against unauthorized access, disclosure, alteration, or destruction.</p>
      <p>However, no method of electronic storage or internet transmission is completely secure, and we cannot guarantee absolute security of your information.</p>
      <h2>Third-party services</h2>
      <p>We may use third-party service providers to operate and maintain our website and services. These providers may include website hosting, email communication, payment processing, customer support, and analytics services.</p>
      <p>Such providers may process limited personal information on our behalf where necessary to perform their services. We do not authorize them to use your information for purposes unrelated to the services they provide to us.</p>
      <h2>Your rights</h2>
      <p>Depending on where you live, you may have rights to access, correct or delete your data. Contact us to make a request.</p>
      <h2>Contact</h2>
      <p><Placeholder>{legal.businessName}</Placeholder> · <Placeholder>{legal.email}</Placeholder></p>
    </LegalPage>
  );
}
