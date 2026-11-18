"use server";
import { requireAdmin } from "@/lib/auth";
import { guarded } from "@/lib/admin/guarded";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { fulfilOrder } from "@/lib/licensing/service";
import { sanitizeText } from "@/lib/security";

const PATH = "/admin/payments";
const str = (f: FormData, k: string, max = 200) => sanitizeText(f.get(k), max);

export async function addMethodAction(f: FormData) {
  await requireAdmin();
  await guarded(PATH, async () => {
    const coin = str(f, "coin", 12).toUpperCase();
    const network = str(f, "network", 40);
    const address = str(f, "address", 128);
    if (coin.length < 2 || network.length < 2) throw new Error("Enter a coin and a network.");
    if (!/^[A-Za-z0-9][A-Za-z0-9:_.\-]{9,127}$/.test(address)) throw new Error("That wallet address does not look valid.");
    const { error } = await supabaseAdmin().from("payment_methods").insert({
      coin, network, address, is_stablecoin: f.get("stable") === "on", instructions: str(f, "instructions", 500) || null, enabled: true,
    });
    if (error) throw new Error(error.message);
  });
}

export async function toggleMethodAction(f: FormData) {
  await requireAdmin();
  await guarded(PATH, async () => {
    const { error } = await supabaseAdmin().from("payment_methods").update({ enabled: f.get("enable") === "1" }).eq("id", str(f, "id", 40));
    if (error) throw new Error(error.message);
  });
}

export async function deleteMethodAction(f: FormData) {
  await requireAdmin();
  await guarded(PATH, async () => {
    const { error } = await supabaseAdmin().from("payment_methods").delete().eq("id", str(f, "id", 40));
    if (error) throw new Error(error.message);
  });
}

/** Approve = you have verified the payment on the blockchain. Issues (or renews) the license. */
export async function approveOrderAction(f: FormData) {
  const admin = await requireAdmin();
  await guarded(PATH, async () => {
    const orderId = str(f, "orderId", 40);
    const db = supabaseAdmin();
    // A previously rejected order can be approved later (e.g. you re-checked the transaction).
    await db.from("orders").update({ order_status: "pending" }).eq("order_id", orderId).eq("order_status", "failed");
    await fulfilOrder(orderId); // idempotent, creates license, marks order confirmed
    await db.from("orders").update({ reviewed_at: new Date().toISOString(), reviewed_by: admin.email, reject_reason: null }).eq("order_id", orderId);
  });
}

export async function rejectOrderAction(f: FormData) {
  const admin = await requireAdmin();
  await guarded(PATH, async () => {
    const reason = str(f, "reason", 300);
    if (!reason) throw new Error("Please give a reason so the customer knows what to fix.");
    const { error } = await supabaseAdmin().from("orders")
      .update({ order_status: "failed", payment_status: "awaiting_payment", reject_reason: reason, reviewed_at: new Date().toISOString(), reviewed_by: admin.email })
      .eq("order_id", str(f, "orderId", 40)).in("order_status", ["pending", "payment_detected"]);
    if (error) throw new Error(error.message);
  });
}
