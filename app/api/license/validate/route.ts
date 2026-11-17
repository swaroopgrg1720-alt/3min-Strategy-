import { NextResponse } from "next/server";
import { clientKey, rateLimit, sanitizeText } from "@/lib/security";
import { hashKey, keyShapeOk, signReply } from "@/lib/licensing/keys";
import { licenseState, logEvent, type LicenseRow } from "@/lib/licensing/service";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Called by the EA (MQL5 WebRequest) or any client.
 * POST { key, account, nonce }  ->  { valid, reason, plan, expires, nonce, ts, sig }
 * - The key is hashed server-side; the plaintext is never stored or logged.
 * - The first valid call binds the license to that MT5 account number (atomically).
 * - Replies are HMAC-signed over (valid|reason|expires|nonce|ts) so a client can detect spoofed replies.
 */
export async function POST(req: Request) {
  const ip = clientKey(req);
  if (!rateLimit(`lic:${ip}`, 30, 60_000)) return NextResponse.json({ valid: false, reason: "rate_limited" }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ valid: false, reason: "bad_request" }, { status: 400 }); }

  const key = sanitizeText(body.key, 40);
  const account = sanitizeText(body.account, 20);
  const nonce = sanitizeText(body.nonce, 64);
  const reply = (valid: boolean, reason: string, plan: string | null = null, expires: string | null = null, status = 200) => {
    const ts = Math.floor(Date.now() / 1000);
    return NextResponse.json({ valid, reason, plan, expires, nonce, ts, sig: signReply([valid, reason, expires ?? "", nonce, ts]) }, { status });
  };

  if (!keyShapeOk(key) || !/^\d{3,12}$/.test(account)) return reply(false, "bad_request", null, null, 400);

  const db = supabaseAdmin();
  const hash = hashKey(key);
  const { data } = await db.from("licenses").select("*").eq("key_hash", hash).maybeSingle();
  const lic = data as LicenseRow | null;
  if (!lic) { await logEvent(null, "validate_unknown_key", { account }, ip); return reply(false, "invalid_key"); }

  const state = licenseState(lic);
  if (state !== "active") { await logEvent(lic.id, `validate_${state}`, { account }, ip); return reply(false, state, lic.plan, lic.expiration_date); }

  if (lic.mt5_account && lic.mt5_account !== account) {
    await logEvent(lic.id, "validate_account_mismatch", { account, bound: lic.mt5_account }, ip);
    return reply(false, "account_mismatch", lic.plan, lic.expiration_date);
  }
  if (!lic.mt5_account) {
    // Atomic bind: only succeeds if still unbound, so two accounts cannot both claim it.
    const { data: bound } = await db.from("licenses")
      .update({ mt5_account: account, activation_status: "activated", activated_at: new Date().toISOString() })
      .eq("id", lic.id).is("mt5_account", null).select("id").maybeSingle();
    if (!bound) return reply(false, "account_mismatch", lic.plan, lic.expiration_date);
    await logEvent(lic.id, "activated", { account }, ip);
  }
  await db.from("licenses").update({ last_validated_at: new Date().toISOString() }).eq("id", lic.id);
  return reply(true, "ok", lic.plan, lic.expiration_date);
}
