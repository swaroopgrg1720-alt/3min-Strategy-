"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createManualLicense, fulfilOrder } from "@/lib/licensing/service";
import { isValidEmail, sanitizeText } from "@/lib/security";
import { lookupPayment } from "@/lib/payments/cryptopayr";
import { settleOrder } from "@/lib/payments/settle";

const str = (f: FormData, k: string, max = 200) => sanitizeText(f.get(k), max);
const done = () => revalidatePath("/admin");

/** Runs an action; on failure, shows the reason on the admin page instead of crashing. */
async function guarded(fn: () => Promise<void>) {
  let failure = "";
  try {
    await fn();
  } catch (e) {
    failure = e instanceof Error ? e.message : "Unknown error";
  }
  if (failure) redirect(`/admin?error=${encodeURIComponent(failure.slice(0, 300))}`);
  done();
}

export async function confirmOrderAction(f: FormData) {
  await requireAdmin(); // every action re-checks admin on the server
  await guarded(async () => { await fulfilOrder(str(f, "orderId", 40)); }); // ONLY after verifying the payment on-chain
}

/** Asks CryptoPayr for the live payment status (use if a webhook was missed) and settles the order if it is COMPLETED and exact. */
export async function syncOrderAction(f: FormData) {
  await requireAdmin();
  await guarded(async () => {
    const { data: order } = await supabaseAdmin().from("orders").select("*").eq("order_id", str(f, "orderId", 40)).maybeSingle();
    if (!order) throw new Error("Order not found.");
    if (!order.provider_ref) throw new Error("This order has no CryptoPayr payment id.");
    const live = await lookupPayment(order.provider_ref);
    if (!live) throw new Error("Could not reach CryptoPayr. Try again.");
    const r = await settleOrder(order, live);
    if (r === "not_completed") throw new Error(`CryptoPayr status: ${live.status}. Nothing to issue yet.`);
    if (r !== "fulfilled") throw new Error(`Payment is ${r}: amount does not match the order. Review it, then use Confirm if you accept it.`);
  });
}

export async function setLicenseStatusAction(f: FormData) {
  await requireAdmin();
  const status = str(f, "status", 12);
  if (!["active", "suspended", "revoked"].includes(status)) return;
  await supabaseAdmin().from("licenses").update({ status }).eq("id", str(f, "id", 60));
  done();
}

export async function extendLicenseAction(f: FormData) {
  await requireAdmin();
  const db = supabaseAdmin();
  const id = str(f, "id", 60);
  const days = Math.min(Math.max(parseInt(str(f, "days", 4), 10) || 30, 1), 3650);
  const { data } = await db.from("licenses").select("plan, expiration_date").eq("id", id).single();
  if (!data || data.plan !== "monthly") return;
  const base = Math.max(Date.now(), data.expiration_date ? new Date(data.expiration_date).getTime() : 0);
  await db.from("licenses").update({ expiration_date: new Date(base + days * 86_400_000).toISOString() }).eq("id", id);
  done();
}

export async function resetAccountAction(f: FormData) {
  await requireAdmin();
  await supabaseAdmin().from("licenses").update({ mt5_account: null, activation_status: "not_activated", activated_at: null }).eq("id", str(f, "id", 60));
  done();
}

/** Returns nothing sensitive; the new key is viewable by the customer in their dashboard or by you via Reveal below. */
export async function createLicenseAction(f: FormData) {
  await requireAdmin();
  const email = str(f, "email", 254).toLowerCase();
  const plan = str(f, "plan", 10);
  if (!isValidEmail(email) || (plan !== "monthly" && plan !== "lifetime")) return;
  await guarded(async () => { await createManualLicense(email, plan); });
}

export async function publishProductAction(f: FormData) {
  await requireAdmin();
  const db = supabaseAdmin();
  const version = str(f, "version", 20);
  const path = str(f, "path", 200);
  if (!version || !path) return;
  await db.from("products").update({ is_current: false }).eq("is_current", true);
  await db.from("products").insert({ version, storage_path: path, release_notes: str(f, "notes", 1000) || null, is_current: true });
  done();
}

export async function setTicketStatusAction(f: FormData) {
  await requireAdmin();
  const status = str(f, "status", 10);
  if (!["open", "answered", "closed"].includes(status)) return;
  await supabaseAdmin().from("support_tickets").update({ status }).eq("id", str(f, "id", 60));
  done();
}
