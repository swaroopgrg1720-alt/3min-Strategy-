import type { PlanId } from "@/lib/config/pricing";
import type { Coin, PaymentStatus } from "@/lib/config/payments";

export type OrderStatus = "pending" | "payment_detected" | "confirmed" | "failed" | "expired" | "refunded";

export interface Order {
  orderId: string;
  customerEmail: string;
  product: "3MIN SCALP";
  plan: PlanId;
  amountUsd: number;
  currency: Coin;
  network: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  confirmedAt: string | null;
  licenseId: string | null;
  downloadEnabled: boolean;
}

export interface CreatePaymentRequest {
  orderId: string;
  plan: PlanId;
  coin: Coin;
  network: string;
  amountUsd: number;
  customerEmail: string;
}

export interface PaymentInstructions {
  orderId: string;
  coin: Coin;
  network: string;
  /** Address comes from the provider / server config, never hard-coded in the client. */
  walletAddress: string;
  amount: string;
  expiresAt: string;
}

/** Implement this for your chosen provider (or direct chain monitoring). */
export interface PaymentProvider {
  createPayment(req: CreatePaymentRequest): Promise<PaymentInstructions>;
  /** Verify the raw webhook body + signature header using CRYPTO_WEBHOOK_SECRET. */
  verifyWebhook(rawBody: string, signature: string | null): Promise<{ orderId: string; status: PaymentStatus } | null>;
}
