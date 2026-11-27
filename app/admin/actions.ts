"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createManualLicense, fulfilOrder, logEvent } from "@/lib/licensing/service";
import { lookupPayment } from "@/lib/payments/cryptopayr";
import { settleOrder } from "@/lib/payments/settle";
import { isValidEmail, sanitizeText } from "@/lib/security";

const str = (f: FormData, k: string, max = 200) => sanitizeText(f.get(k), max);
const DAY = 86_400_000;

type Outcome = string | { info: string } | void;

/**
 * Every admin action goes through here: it re-checks the admin on the server, runs the work,
 * then returns to the page the button was on (hidden "back" field) with a green, grey or red notice.
 */
async function run(f: FormData, okMessage: string, fn: () => Promise<Outcome>): Promise<void> {
  await requireAdmin();
  let failure = "";
  let outcome = undefined as Outcome;
  try {
    outcome = await fn();
  } catch (e) {
    failure = e instanceof Error ? e.message : "Unknown error";
  }
  const raw = str(f, "back", 300);
  const u = new URL(raw.startsWith("/admin") && !raw.startsWith("//") ? raw : "/admin", "http://local");
  ["ok", "info", "error", "t"].forEach((k) => u.searchParams.delete(k));
  if (failure) u.searchParams.set("error", failure.slice(0, 300));
  else if (typeof outcome === "object" && outcome !== null) u.searchParams.set("info", outcome.info);
  else u.searchParams.set("ok", typeof outcome === "string" ? outcome : okMessage);
  u.searchParams.set("t", String(Date.now())); // lets open menus close after an action
  revalidatePath("/admin", "layout");
  redirect(u.pathname + u.search);
}

/* ───────── Orders ───────── */

export async function confirmOrderAction(f: FormData) {
  await run(f, "Order confirmed and license issued.", async () => { await fulfilOrder(str(f, "orderId", 40)); });
}

/** Asks CryptoPayr for the live payment status (use if a webhook was missed) and settles the order if it is COMPLETED and exact. */
export async function syncOrderAction(f: FormData) {
  await run(f, "Payment confirmed by CryptoPayr. License issued.", async () => {
    const { data: order } = await supabaseAdmin().from("orders").select("*").eq("order_id", str(f, "orderId", 40)).maybeSingle();
    if (!order) throw new Error("Order not found.");
    if (!order.provider_ref) throw new Error("This order has no CryptoPayr payment id.");
    const live = await lookupPayment(order.provider_ref);
    if (!live) throw new Error("Could not reach CryptoPayr. Try again.");
    const r = await settleOrder(order, live);
    if (r === "not_completed") return { info: `CryptoPayr says this payment is ${live.status}. Nothing to issue yet.` };
    if (r !== "fulfilled") throw new Error(`Payment is ${r}: the amount does not match the order. Review it, then use "Confirm paid" if you accept it.`);
  });
}

export async function deleteOrderAction(f: FormData) {
  await run(f, "Order deleted.", async () => {
    const db = supabaseAdmin();
    const id = str(f, "orderId", 40);
    const { data } = await db.from("orders").select("order_status").eq("order_id", id).maybeSingle();
    if (!data) throw new Error("Order not found.");
    if (!["pending", "failed", "expired"].includes(data.order_status)) throw new Error("Only unpaid orders (pending, failed or expired) can be deleted.");
    const { error } = await db.from("orders").delete().eq("order_id", id);
    if (error) throw new Error(error.message);
  });
}

/* ───────── Licenses ───────── */

export async function setLicenseStatusAction(f: FormData) {
  const status = str(f, "status", 12);
  const label: Record<string, string> = { active: "License reactivated.", suspended: "License suspended.", revoked: "License revoked." };
  await run(f, label[status] ?? "Updated.", async () => {
    if (!["active", "suspended", "revoked"].includes(status)) throw new Error("Invalid status.");
    const id = str(f, "id", 60);
    const { error } = await supabaseAdmin().from("licenses").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    await logEvent(id, "admin_status", { status });
  });
}

export async function extendLicenseAction(f: FormData) {
  const days = Math.min(Math.max(parseInt(str(f, "days", 4), 10) || 30, 1), 3650);
  await run(f, `Added ${days} days.`, async () => {
    const db = supabaseAdmin();
    const id = str(f, "id", 60);
    const { data } = await db.from("licenses").select("plan, expiration_date").eq("id", id).single();
    if (!data) throw new Error("License not found.");
    if (data.plan !== "monthly") throw new Error("Lifetime licenses never expire.");
    const base = Math.max(Date.now(), data.expiration_date ? new Date(data.expiration_date).getTime() : 0);
    const { error } = await db.from("licenses").update({ expiration_date: new Date(base + days * DAY).toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    await logEvent(id, "admin_extend", { days });
  });
}

export async function setExpiryAction(f: FormData) {
  await run(f, "Expiry date updated.", async () => {
    const date = str(f, "date", 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Pick a valid date.");
    const when = new Date(`${date}T23:59:59Z`);
    if (Number.isNaN(when.getTime())) throw new Error("Pick a valid date.");
    const db = supabaseAdmin();
    const id = str(f, "id", 60);
    const { data } = await db.from("licenses").select("plan").eq("id", id).single();
    if (!data) throw new Error("License not found.");
    if (data.plan !== "monthly") throw new Error("Lifetime licenses have no expiry date.");
    const { error } = await db.from("licenses").update({ expiration_date: when.toISOString() }).eq("id", id);
    if (error) throw new Error(error.message);
    await logEvent(id, "admin_set_expiry", { date });
  });
}

export async function resetAccountAction(f: FormData) {
  await run(f, "MT5 account unbound. The customer can enter a new one.", async () => {
    const id = str(f, "id", 60);
    const { error } = await supabaseAdmin().from("licenses").update({ mt5_account: null, activation_status: "not_activated", activated_at: null }).eq("id", id);
    if (error) throw new Error(error.message);
    await logEvent(id, "admin_unbind", {});
  });
}

export async function deleteLicenseAction(f: FormData) {
  await run(f, "License deleted.", async () => {
    const db = supabaseAdmin();
    const id = str(f, "id", 60);
    // Clear references first so the delete cannot be blocked by history rows.
    await db.from("downloads").delete().eq("license_id", id);
    await db.from("license_events").delete().eq("license_id", id);
    await db.from("orders").update({ license_id: null }).eq("license_id", id);
    const { error } = await db.from("licenses").delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}

export async function createLicenseAction(f: FormData) {
  const email = str(f, "email", 254).toLowerCase();
  const plan = str(f, "plan", 10);
  const days = Math.min(Math.max(parseInt(str(f, "days", 4), 10) || 30, 1), 3650);
  await run(f, "License created. The customer sees the key after signing in with that email.", async () => {
    if (!isValidEmail(email)) throw new Error("Enter a valid email address.");
    if (plan !== "monthly" && plan !== "lifetime") throw new Error("Pick a plan.");
    await createManualLicense(email, plan, days);
  });
}

/* ───────── EA downloads ───────── */

export async function publishProductAction(f: FormData) {
  await run(f, "New EA version published and set as current.", async () => {
    const db = supabaseAdmin();
    const version = str(f, "version", 20);
    const path = str(f, "path", 200);
    if (!version || !path) throw new Error("Choose a file and enter a version.");
    await db.from("products").update({ is_current: false }).eq("is_current", true);
    const { error } = await db.from("products").insert({ version, storage_path: path, release_notes: str(f, "notes", 1000) || null, is_current: true });
    if (error) throw new Error(error.message);
  });
}

export async function setCurrentProductAction(f: FormData) {
  await run(f, "That version is now the one customers download.", async () => {
    const db = supabaseAdmin();
    const id = str(f, "id", 60);
    await db.from("products").update({ is_current: false }).eq("is_current", true);
    const { error } = await db.from("products").update({ is_current: true }).eq("id", id);
    if (error) throw new Error(error.message);
  });
}

export async function deleteProductAction(f: FormData) {
  await run(f, "Version removed from the list. The file stays in storage.", async () => {
    const db = supabaseAdmin();
    const id = str(f, "id", 60);
    const { data } = await db.from("products").select("is_current").eq("id", id).maybeSingle();
    if (data?.is_current) throw new Error("This is the current version. Make another version current first.");
    await db.from("downloads").update({ product_id: null }).eq("product_id", id);
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  });
}

/* ───────── Support ───────── */

export async function setTicketStatusAction(f: FormData) {
  await run(f, "Ticket updated.", async () => {
    const status = str(f, "status", 10);
    if (!["open", "answered", "closed"].includes(status)) throw new Error("Invalid status.");
    const { error } = await supabaseAdmin().from("support_tickets").update({ status }).eq("id", str(f, "id", 60));
    if (error) throw new Error(error.message);
  });
}

/* ───────── TradingView indicator access ───────── */

export async function grantIndicatorAction(f: FormData) {
  await run(f, "Marked as granted. The customer was emailed.", async () => {
    const db = supabaseAdmin();
    const { data: a } = await db.from("indicator_access").select("*").eq("id", str(f, "id", 40)).maybeSingle();
    if (!a) throw new Error("Access not found.");
    const now = Date.now();
    const expires = a.plan === "lifetime" ? null : new Date(now + DAY * 30 * Math.max(1, a.months ?? 1)).toISOString();
    const { error } = await db.from("indicator_access").update({ status: "active", granted_at: new Date(now).toISOString(), expires_at: expires }).eq("id", a.id);
    if (error) throw new Error(error.message);
    const { sendEmail } = await import("@/lib/email/send");
    await sendEmail({ to: a.customer_email, subject: "Your TradingView indicator is ready", text: `Your access was added to the TradingView username @${a.tv_username}.\n\nOpen TradingView, click Indicators, choose Invite-only scripts and add the indicator to your chart.\n\nYou can see the status in your dashboard.` }).catch(() => false);
  });
}

export async function extendIndicatorAction(f: FormData) {
  await run(f, "Extended by 30 days.", async () => {
    const db = supabaseAdmin();
    const { data: a } = await db.from("indicator_access").select("*").eq("id", str(f, "id", 40)).maybeSingle();
    if (!a) throw new Error("Access not found.");
    if (a.plan !== "monthly") throw new Error("Lifetime access has no expiry.");
    const base = Math.max(Date.now(), a.expires_at ? Date.parse(a.expires_at) : 0);
    const { error } = await db.from("indicator_access").update({ expires_at: new Date(base + 30 * DAY).toISOString() }).eq("id", a.id);
    if (error) throw new Error(error.message);
  });
}

export async function setIndicatorStatusAction(f: FormData) {
  await run(f, "Updated.", async () => {
    const status = str(f, "status", 20);
    if (!["pending", "active", "revoked"].includes(status)) throw new Error("Invalid status.");
    const { error } = await supabaseAdmin().from("indicator_access").update({ status }).eq("id", str(f, "id", 40));
    if (error) throw new Error(error.message);
  });
}

export async function deleteIndicatorAction(f: FormData) {
  await run(f, "Deleted.", async () => {
    const { error } = await supabaseAdmin().from("indicator_access").delete().eq("id", str(f, "id", 40));
    if (error) throw new Error(error.message);
  });
}
