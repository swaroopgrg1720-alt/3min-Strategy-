import "server-only";
import { supabaseServer } from "@/lib/supabase/server";
import { licenseState } from "@/lib/licensing/service";

export interface CustomerLicense {
  id: string; license_ref: string; plan: "monthly" | "lifetime"; expiration_date: string | null;
  status: "active" | "suspended" | "revoked"; mt5_account: string | null; activation_status: string; start_date: string;
}

/** Reads through the user's own session, so RLS guarantees they only see their own rows. */
export async function myLicenses() {
  const { data } = await (await supabaseServer()).from("licenses")
    .select("id,license_ref,plan,expiration_date,status,mt5_account,activation_status,start_date").order("created_at", { ascending: false });
  return ((data ?? []) as CustomerLicense[]).map((l) => ({ ...l, state: licenseState(l) }));
}

/** The EA version customers currently download (read-only, server side). */
export async function currentProduct(): Promise<{ version: string; release_notes: string | null; created_at: string | null } | null> {
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const { data } = await supabaseAdmin().from("products").select("*").eq("is_current", true).maybeSingle();
    return data ? { version: data.version, release_notes: data.release_notes ?? null, created_at: data.created_at ?? null } : null;
  } catch { return null; }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

export type CustomerLicenseFull = CustomerLicense & { activated_at: string | null; last_validated_at: string | null; state: ReturnType<typeof licenseState> };

/** One of the signed-in customer's licenses with activity details (RLS limits it to their own). */
export async function myLicenseById(id: string): Promise<CustomerLicenseFull | null> {
  if (!isUuid(id)) return null;
  const { data } = await (await supabaseServer()).from("licenses")
    .select("id,license_ref,plan,expiration_date,status,mt5_account,activation_status,start_date,activated_at").eq("id", id).maybeSingle();
  if (!data) return null;
  // Customers may not read last_validated_at directly (column-level grant), so read it on the server now that ownership is proven.
  let last: string | null = null;
  try {
    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    const r = await supabaseAdmin().from("licenses").select("last_validated_at").eq("id", id).maybeSingle();
    last = (r.data?.last_validated_at as string | null) ?? null;
  } catch { /* optional detail */ }
  const l = { ...(data as CustomerLicense & { activated_at: string | null }), last_validated_at: last };
  return { ...l, state: licenseState(l) };
}

export interface PaymentRow { order_id: string; plan: string; amount_usd: number | string; coin: string; network: string; order_status: string; created_at: string; confirmed_at: string | null }

/** Paid orders that created or renewed this license. */
export async function licensePayments(id: string): Promise<PaymentRow[]> {
  if (!isUuid(id)) return [];
  const db = await supabaseServer();
  const cols = "order_id,plan,amount_usd,coin,network,order_status,created_at,confirmed_at";
  const states = ["confirmed", "refunded", "payment_detected"];
  let r = await db.from("orders").select(cols).or(`license_id.eq.${id},renew_license_id.eq.${id}`).in("order_status", states).order("created_at", { ascending: false }).limit(20);
  if (r.error) r = await db.from("orders").select(cols).eq("license_id", id).in("order_status", states).order("created_at", { ascending: false }).limit(20);
  return (r.data ?? []) as PaymentRow[];
}
