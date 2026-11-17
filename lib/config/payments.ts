/**
 * Crypto-only payment configuration.
 * Networks and wallet addresses are NOT assumed: set them here (or load from your
 * payment provider / database) before going live. Never put private keys in this repo.
 */
export type Coin = "USDT" | "USDC" | "BTC";

export interface CryptoOption {
  coin: Coin;
  enabled: boolean;
  /** Networks you have decided to accept for this coin. Empty until you configure them. */
  networks: string[];
}

export const WALLET_PLACEHOLDER = "[CRYPTO WALLET ADDRESS]";
export const PAYMENT_WINDOW_SECONDS = 30 * 60;

export const cryptoOptions: CryptoOption[] = [
  { coin: "USDT", enabled: true, networks: ["[NETWORK — CONFIGURE]"] },
  { coin: "USDC", enabled: true, networks: ["[NETWORK — CONFIGURE]"] },
  { coin: "BTC", enabled: true, networks: ["[NETWORK — CONFIGURE]"] },
];

export const PAYMENT_STATUS_LABELS = {
  awaiting_payment: "Awaiting Payment",
  payment_detected: "Payment Detected",
  payment_confirmed: "Payment Confirmed",
  order_complete: "Order Complete",
  payment_expired: "Payment Expired",
} as const;

export type PaymentStatus = keyof typeof PAYMENT_STATUS_LABELS;
