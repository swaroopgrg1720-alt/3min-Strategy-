import "server-only";
import { deriveStatus } from "./status";

const maskEmail = (e: string) => {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
};

/** Shape returned to the checkout page. Never includes admin-only fields. */
export function toOrderView(o: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    orderId: o.order_id as string,
    plan: o.plan as "monthly" | "lifetime",
    amountUsd: Number(o.amount_usd),
    coin: o.coin as string,
    network: o.network as string,
    walletAddress: (o.wallet_address ?? "") as string,
    isStablecoin: !!o.is_stablecoin,
    payNote: (o.pay_note ?? null) as string | null,
    status: deriveStatus(o as { order_status: string; tx_hash: string | null; expires_at: string | null }),
    txHash: (o.tx_hash ?? null) as string | null,
    rejectReason: (o.reject_reason ?? null) as string | null,
    expiresAt: (o.expires_at ?? null) as string | null,
    email: maskEmail(String(o.customer_email ?? "")),
  };
}
