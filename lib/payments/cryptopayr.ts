import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** CryptoPayr integration. Docs: https://cryptopayr.com/docs */
const BASE = "https://cryptopayr.com/api/v1";

export interface CreatePaymentInput { orderId: string; amountUsd: number; successUrl: string; cancelUrl: string; webhookUrl: string }
export interface CreatedPayment { tid: string; checkoutUrl: string }

/** Creates a payment. The customer is then sent to checkoutUrl, where they pick the coin and network. */
export async function createPayment(i: CreatePaymentInput): Promise<CreatedPayment> {
  const key = process.env.CRYPTO_PAYMENT_API_KEY?.trim();
  if (!key) throw new Error("CRYPTO_PAYMENT_API_KEY is not set");
  const res = await fetch(`${BASE}/payment/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": i.orderId },
    body: JSON.stringify({
      amount: i.amountUsd, currency: "USD", webhook_url: i.webhookUrl,
      success_url: i.successUrl, cancel_url: i.cancelUrl, metadata: i.orderId,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => null)) as { message?: string; data?: { tid?: string; checkout_url?: string } } | null;
  const tid = json?.data?.tid;
  const url = json?.data?.checkout_url;
  if (!res.ok || !tid || !url) throw new Error(json?.message || `CryptoPayr error (${res.status})`);
  const host = new URL(url).hostname;
  if (!/(^|\.)cryptopayr\.com$/i.test(host)) throw new Error("Unexpected checkout URL from provider");
  return { tid, checkoutUrl: url };
}

export interface PaymentSnapshot {
  tid: string; status: string; amount: string | number; currency: string; underpaid?: boolean;
}

/** Public, no-key endpoint. Used to double-check a payment independently of the webhook. Returns null if unreachable. */
export async function lookupPayment(tid: string): Promise<PaymentSnapshot | null> {
  try {
    const res = await fetch(`${BASE}/payment/lookup?tid=${encodeURIComponent(tid)}`, { cache: "no-store", signal: AbortSignal.timeout(6_000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Partial<PaymentSnapshot> } & Partial<PaymentSnapshot>;
    const d = json.data ?? json;
    if (typeof d.tid !== "string" || typeof d.status !== "string" || d.amount == null || typeof d.currency !== "string") return null;
    return { tid: d.tid, status: d.status, amount: d.amount, currency: d.currency, underpaid: !!d.underpaid };
  } catch {
    return null;
  }
}

export interface WebhookEvent extends PaymentSnapshot { metadata?: unknown; timestamp?: number }

const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Verifies X-CryptoPayr-Signature: HMAC-SHA256 of the RAW body, keyed with your secret API key. */
export function verifyWebhook(raw: string, header: string | null): WebhookEvent | null {
  const secret = process.env.CRYPTO_WEBHOOK_SECRET?.trim() || process.env.CRYPTO_PAYMENT_API_KEY?.trim();
  if (!secret || !header) return null;
  const sig = header.trim().replace(/^sha256=/i, "");
  const mac = createHmac("sha256", secret).update(raw).digest();
  if (!safeEq(mac.toString("hex"), sig.toLowerCase()) && !safeEq(mac.toString("base64"), sig)) return null;
  try {
    const e = JSON.parse(raw) as Partial<WebhookEvent>;
    if (typeof e.tid !== "string" || typeof e.status !== "string" || e.amount == null || typeof e.currency !== "string") return null;
    return { tid: e.tid, status: e.status, amount: e.amount, currency: e.currency, underpaid: !!e.underpaid, metadata: e.metadata, timestamp: e.timestamp };
  } catch {
    return null;
  }
}

/** Does a completed payment cover the order exactly? "underpaid" and "mismatch" are NOT fulfilled automatically. */
export function matchOrder(p: Pick<PaymentSnapshot, "amount" | "currency" | "underpaid">, order: { amount_usd: number | string }): "ok" | "underpaid" | "mismatch" {
  if (p.underpaid) return "underpaid";
  if (p.currency.toUpperCase() !== "USD") return "mismatch";
  return Math.abs(Number(p.amount) - Number(order.amount_usd)) < 0.005 ? "ok" : "mismatch";
}
