import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { newKeyMaterial } from "./keys";

export interface LicenseRow {
  id: string;
  license_ref: string;
  customer_email: string;
  plan: "monthly" | "lifetime";
  start_date: string;
  expiration_date: string | null;
  status: "active" | "suspended" | "revoked";
  mt5_account: string | null;
  activation_status: "not_activated" | "activated";
  key_hash: string;
  key_ciphertext: string;
}

/** Single source of truth for "can this license be used right now?" */
export function licenseState(l: Pick<LicenseRow, "status" | "plan" | "expiration_date">, now = new Date()) {
  if (l.status !== "active") return l.status; // suspended | revoked
  if (l.plan === "monthly" && (!l.expiration_date || new Date(l.expiration_date) <= now)) return "expired" as const;
  return "active" as const;
}

/** Called ONLY after a verified payment (signed webhook) or an admin confirmation. Idempotent. */
export async function fulfilOrder(orderId: string): Promise<string> {
  const db = supabaseAdmin();
  const m = newKeyMaterial();
  const { data, error } = await db.rpc("fulfil_order", {
    p_order_id: orderId,
    p_ref: m.ref,
    p_key_hash: m.hash,
    p_key_prefix: m.prefix,
    p_key_cipher: m.cipher,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Admin: issue a license without an order (gift, manual crypto confirmation, support). Returns the key ONCE. */
export async function createManualLicense(email: string, plan: "monthly" | "lifetime", days = 30) {
  const db = supabaseAdmin();
  const m = newKeyMaterial();
  const { error } = await db.from("licenses").insert({
    license_ref: m.ref,
    customer_email: email.toLowerCase(),
    plan,
    expiration_date: plan === "monthly" ? new Date(Date.now() + days * 86_400_000).toISOString() : null,
    key_hash: m.hash,
    key_prefix: m.prefix,
    key_ciphertext: m.cipher,
  });
  if (error) throw new Error(error.message);
  return { ref: m.ref, key: m.key };
}

export async function logEvent(licenseId: string | null, event: string, detail: Record<string, unknown>, ip?: string) {
  try {
    await supabaseAdmin().from("license_events").insert({ license_id: licenseId, event, detail, ip });
  } catch {
    /* logging must never break validation */
  }
}
