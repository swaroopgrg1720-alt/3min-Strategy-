import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { PAYMENT_WINDOW_SECONDS, WALLET_PLACEHOLDER } from "@/lib/config/payments";
import type { PaymentProvider } from "./types";

/**
 * Placeholder provider. It returns the wallet placeholder and never confirms anything on its own.
 * Replace createPayment() with your provider's API call (key from CRYPTO_PAYMENT_API_KEY),
 * and keep verifyWebhook()'s signature check.
 */
export const paymentProvider: PaymentProvider = {
  async createPayment(req) {
    return {
      orderId: req.orderId,
      coin: req.coin,
      network: req.network,
      walletAddress: WALLET_PLACEHOLDER,
      amount: req.amountUsd.toFixed(2),
      expiresAt: new Date(Date.now() + PAYMENT_WINDOW_SECONDS * 1000).toISOString(),
    };
  },

  async verifyWebhook(rawBody, signature) {
    const secret = process.env.CRYPTO_WEBHOOK_SECRET;
    if (!secret || !signature) return null;
    const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    try {
      const parsed = JSON.parse(rawBody) as { orderId?: string; status?: string };
      if (!parsed.orderId || !parsed.status) return null;
      // Map your provider's status vocabulary to ours here.
      return { orderId: parsed.orderId, status: parsed.status as never };
    } catch {
      return null;
    }
  },
};
