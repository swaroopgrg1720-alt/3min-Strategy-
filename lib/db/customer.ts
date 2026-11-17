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
