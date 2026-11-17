import type { PlanId } from "@/lib/config/pricing";

export type LicenseStatus = "active" | "expired" | "suspended" | "revoked";
export type ActivationStatus = "not_activated" | "activated";

export interface License {
  licenseId: string;
  customerEmail: string;
  product: "3MIN SCALP";
  plan: PlanId;
  startDate: string;
  /** Required for monthly. Must be null for lifetime. */
  expirationDate: string | null;
  status: LicenseStatus;
  mt5Account: string | null;
  activationStatus: ActivationStatus;
}

export function validateLicenseShape(l: License): string[] {
  const errors: string[] = [];
  if (l.plan === "monthly" && !l.expirationDate) errors.push("Monthly licenses require an expiration date.");
  if (l.plan === "lifetime" && l.expirationDate) errors.push("Lifetime licenses must not have an expiration date.");
  return errors;
}

export function isLicenseUsable(l: License, now = new Date()): boolean {
  if (l.status !== "active") return false;
  if (l.plan === "lifetime") return true;
  return !!l.expirationDate && new Date(l.expirationDate) > now;
}

/**
 * Licenses are validated SERVER-SIDE ONLY (database lookup behind authenticated routes).
 * Do not ship license keys or validation logic to the browser.
 * An EX5 cannot be hardened by this website alone: any in-EA account/expiry check must be
 * compiled into the EX5 by whoever holds the source, and verified against a server endpoint.
 */
