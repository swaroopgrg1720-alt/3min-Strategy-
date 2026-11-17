/** Email templates with placeholders. Wire to your provider (EMAIL_API_KEY) in a server-only module. */
export type EmailTemplateId =
  | "purchase_confirmation"
  | "payment_confirmation"
  | "license_created"
  | "download_available"
  | "subscription_expiring"
  | "password_reset"
  | "support_ticket";

export const emailTemplates: Record<EmailTemplateId, { subject: string; body: string }> = {
  purchase_confirmation: {
    subject: "Your 3MIN SCALP order {{orderId}}",
    body: "Thanks for your order {{orderId}}. We are waiting for your {{coin}} payment. Payment window ends {{expiresAt}}.",
  },
  payment_confirmation: {
    subject: "Payment confirmed — order {{orderId}}",
    body: "We have confirmed your payment for order {{orderId}}. Your license is being prepared.",
  },
  license_created: {
    subject: "Your 3MIN SCALP license is ready",
    body: "Your {{plan}} license ({{licenseId}}) has been created. Sign in to your customer area to view it.",
  },
  download_available: {
    subject: "Your 3MIN SCALP download is available",
    body: "Sign in to your customer area to download 3MIN SCALP v{{version}}.",
  },
  subscription_expiring: {
    subject: "Your 3MIN SCALP license expires on {{expirationDate}}",
    body: "Your monthly license expires on {{expirationDate}}. Renew from your customer area to keep access.",
  },
  password_reset: {
    subject: "Reset your 3MIN SCALP password",
    body: "Use this link to reset your password: {{resetUrl}}. If you did not request it, ignore this email.",
  },
  support_ticket: {
    subject: "Support ticket {{ticketId}} received",
    body: "We received your request ({{ticketId}}) and will reply by email.",
  },
};

export function render(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}
