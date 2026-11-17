import type { Metadata } from "next";
import { LegalPage, Placeholder } from "@/components/ui/LegalPage";
import { legal } from "@/lib/config/legal";

export const metadata: Metadata = { title: "Refund Policy", alternates: { canonical: "/refund-policy" }, description: "Refund policy for 3MIN SCALP." };

export default function Page() {
  return (
    <LegalPage title="Refund Policy">
      <p>
        Payments for 3MIN SCALP are made in cryptocurrency. Please read the policy below before purchasing.
      </p>
      <h2>Policy</h2>
      <p><Placeholder>{legal.refundPolicy}</Placeholder></p>
      <p>
        Edit this text in one place: set <code>NEXT_PUBLIC_REFUND_POLICY_TEXT</code> or change <code>lib/config/legal.ts</code>.
      </p>
      <h2>Questions</h2>
      <p>Contact <Placeholder>{legal.email}</Placeholder> with your Order ID.</p>
    </LegalPage>
  );
}
