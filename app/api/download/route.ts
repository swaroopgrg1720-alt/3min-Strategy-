import { NextResponse } from "next/server";

/**
 * Secure download flow (not implemented until auth + storage are configured):
 *  1. Require an authenticated session (AUTH_SECRET).
 *  2. Look up the customer's license; require isLicenseUsable().
 *  3. Generate a short-lived signed URL to a PRIVATE bucket object (PRODUCT_STORAGE_BUCKET), or stream it.
 *  4. Log the download.
 * The EX5 must never live in /public or at a permanent public URL.
 */
export async function GET() {
  return NextResponse.json({ error: "Downloads are not enabled yet." }, { status: 501 });
}
