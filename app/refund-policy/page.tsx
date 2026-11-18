import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/refund-policy" }, description: "No Refund Policy for 3MIN SCALP: all purchases are final and non-refundable." };

export default function Page() {
  return (
    <LegalPage title="No Refund Policy">
      <p><strong>All purchases are final and non-refundable.</strong> Once payment is completed and access to the EA or its license is provided, no refunds, cancellations, or chargebacks will be accepted.</p>
      <p>By purchasing our product, you acknowledge and agree to this No Refund Policy.</p>
      <p>Please note that we do not guarantee profits or specific trading results. Trading performance may vary depending on market conditions, broker execution, spreads, and individual trading settings.</p>
      <p>We strongly recommend reviewing all product details, supported instruments, compatibility requirements, and documentation before making a purchase.</p>
      <p>If you have any questions or concerns before purchasing, please contact our support team for clarification.</p>
      <h2>Questions</h2>
      <p>Contact <Placeholder>{legal.email}</Placeholder> before you buy, or include your Order ID if you already have.</p>
    </LegalPage>
  );
}
