import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/security";
import { supabaseAdmin } from "@/lib/supabase/admin";

const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export const clientIp = async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

/**
 * Brute-force protection stored in the database, so it holds across all servers.
 * If the table does not exist yet (migration 008 not run) it falls back to a per-server in-memory limit.
 */
export async function tooMany(key: string, max: number, windowSec: number): Promise<boolean> {
  try {
    const since = new Date(Date.now() - windowSec * 1000).toISOString();
    const { count, error } = await supabaseAdmin().from("auth_attempts").select("id", { count: "exact", head: true }).eq("k", hash(key)).gt("at", since);
    if (error) throw error;
    return (count ?? 0) >= max;
  } catch {
    return !rateLimit(`fallback:${key}`, max + 1, windowSec * 1000) ? true : false;
  }
}

export async function hit(key: string) {
  try {
    const db = supabaseAdmin();
    await db.from("auth_attempts").insert({ k: hash(key) });
    if (Math.random() < 0.02) await db.from("auth_attempts").delete().lt("at", new Date(Date.now() - 86_400_000).toISOString());
  } catch { /* table missing: in-memory fallback in tooMany still counts */ }
}

export async function clear(key: string) {
  try { await supabaseAdmin().from("auth_attempts").delete().eq("k", hash(key)); } catch { /* ignore */ }
}
