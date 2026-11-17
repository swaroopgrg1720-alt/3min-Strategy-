import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function secret(name: string): Buffer {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return Buffer.from(v, "base64");
}

/** 3MS-XXXXX-XXXXX-XXXXX-XXXXX (100 bits of randomness). */
export function generateLicenseKey(): string {
  const bytes = randomBytes(20);
  const chars = Array.from(bytes, (b) => ALPHABET[b % 32]);
  const groups = [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join(""));
  return `3MS-${groups.join("-")}`;
}

export const normalizeKey = (k: string) => k.trim().toUpperCase();
export const keyShapeOk = (k: string) => /^3MS(-[A-HJ-NP-Z2-9]{5}){4}$/.test(normalizeKey(k));

/** Keyed hash: a stolen database alone cannot be used to brute-force or forge keys. */
export function hashKey(key: string): string {
  return createHmac("sha256", secret("LICENSE_KEY_PEPPER")).update(normalizeKey(key)).digest("hex");
}

export function encryptKey(key: string): string {
  const k = secret("LICENSE_ENCRYPTION_KEY");
  if (k.length !== 32) throw new Error("LICENSE_ENCRYPTION_KEY must be 32 bytes, base64 encoded");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([c.update(key, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}

export function decryptKey(blob: string): string {
  const [iv, tag, ct] = blob.split(".").map((p) => Buffer.from(p, "base64"));
  const d = createDecipheriv("aes-256-gcm", secret("LICENSE_ENCRYPTION_KEY"), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

export const newLicenseRef = () => "LIC-" + Array.from(randomBytes(8), (b) => ALPHABET[b % 32]).join("");

/** HMAC over the validation reply so the EA can check it came from your server. */
export function signReply(parts: (string | number | boolean)[]): string {
  return createHmac("sha256", secret("LICENSE_RESPONSE_SECRET")).update(parts.join("|")).digest("hex");
}

export function newKeyMaterial() {
  const key = generateLicenseKey();
  return { key, hash: hashKey(key), prefix: key.slice(0, 9), cipher: encryptKey(key), ref: newLicenseRef() };
}
