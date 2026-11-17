"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createManualLicense, fulfilOrder } from "@/lib/licensing/service";
import { isValidEmail, sanitizeText } from "@/lib/security";

const str = (f: FormData, k: string, max = 200) => sanitizeText(f.get(k), max);
const done = () => revalidatePath("/admin");

export async function confirmOrderAction(f: FormData) {
  await requireAdmin(); // every action re-checks admin on the server
  await fulfilOrder(str(f, "orderId", 40)); // use ONLY after you have verified the payment on-chain
  done();
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
  await createManualLicense(email, plan);
  done();
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
