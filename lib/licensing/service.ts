import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { newKeyMaterial } from "./keys";
import { INDICATOR_PRODUCT } from "@/lib/config/pricing";
import { escapeHtml, sendEmail } from "@/lib/email/send";
import { site } from "@/lib/config/site";

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
  const { data: ord } = await db.from("orders").select("product,customer_email,tv_username,plan,months,renew_access_id,order_status").eq("order_id", orderId).maybeSingle();
  if (ord?.product === INDICATOR_PRODUCT) return fulfilIndicator(orderId, ord);
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


/** TradingView indicator purchase: records the access request and tells the owner to add the username in TradingView. */
async function fulfilIndicator(orderId: string, ord: { customer_email: string; tv_username: string | null; plan: string; months: number | null; renew_access_id: string | null; order_status: string }): Promise<string> {
  const { data, error } = await supabaseAdmin().rpc("fulfil_indicator_order", { p_order_id: orderId });
  if (error) throw new Error(error.message);
  if (ord.order_status !== "confirmed") {
    const to = (process.env.ADMIN_EMAILS ?? "").split(",").map((x) => x.trim()).filter(Boolean);
    if (to.length) {
      const what = ord.renew_access_id ? "Indicator renewal" : "New indicator purchase";
      const detail = `${ord.plan}${ord.plan === "monthly" ? ` x ${ord.months ?? 1} month(s)` : ""}`;
      const link = `${site.url}/admin/indicator`;
      void sendEmail({
        to, subject: `${what}: ${ord.tv_username ?? ""}`,
        text: `${what}\nTradingView username: ${ord.tv_username}\nEmail: ${ord.customer_email}\nPlan: ${detail}\nOrder: ${orderId}\n\nAdd the username in TradingView, then mark it as granted: ${link}`,
        html: `<p><strong>${what}</strong></p><p>TradingView username: <strong>${escapeHtml(ord.tv_username ?? "")}</strong><br>Email: ${escapeHtml(ord.customer_email)}<br>Plan: ${escapeHtml(detail)}<br>Order: ${escapeHtml(orderId)}</p><p>Add the username in TradingView, then <a href="${link}">mark it as granted</a>.</p>`,
      }).catch(() => {});
    }
  }
  return data as string;
}
