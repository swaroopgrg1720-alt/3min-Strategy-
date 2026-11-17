import "server-only";
import { createHash } from "node:crypto";

/**
 * Offline EA key, identical to keygen.py:
 *   key = <YYYYMMDD expiry> + "-" + first 20 hex chars (UPPERCASE) of SHA256("<SALT>|<mt5 login>|<expiry>")
 * EA_SECRET_SALT must equal the SECRET_SALT compiled into the EA. Set it ONLY in Vercel, never in the repo.
 */
export function makeEaKey(login: string | number, expiryYmd: string): string {
  const salt = process.env.EA_SECRET_SALT;
  if (!salt) throw new Error("EA_SECRET_SALT is not set in Vercel.");
  const account = String(parseInt(String(login), 10)); // same as Python int(login)
  const digest = createHash("sha256").update(`${salt}|${account}|${expiryYmd}`, "utf8").digest("hex").toUpperCase();
  return `${expiryYmd}-${digest.slice(0, 20)}`;
}

/** Lifetime = 20991231 (as in keygen.py). Monthly = the license's expiration date (UTC). */
export function expiryYmd(plan: "monthly" | "lifetime", expirationDate: string | null): string {
  if (plan === "lifetime" || !expirationDate) return "20991231";
  return new Date(expirationDate).toISOString().slice(0, 10).replace(/-/g, "");
}
