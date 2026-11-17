import { site } from "@/lib/config/site";

/** Single place to edit legal placeholders. Replace before launch. */
export const legal = {
  ...site.legal,
  email: site.email,
  refundPolicy: process.env.NEXT_PUBLIC_REFUND_POLICY_TEXT?.trim() || "[INSERT FINAL REFUND POLICY]",
};
