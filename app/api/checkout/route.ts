import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getUser } from "@/lib/auth";
import { INDICATOR_PRODUCT, indicatorPlanAvailable, indicatorTotalUsd, isPlanId, isTvUsername, orderTotalUsd, parseMonths } from "@/lib/config/pricing";
import { site } from "@/lib/config/site";
import { createPayment } from "@/lib/payments/cryptopayr";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase/admin";

/** Creates an order and a CryptoPayr payment. The AMOUNT is always derived server-side from the product and plan. */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientKey(req)}`, 10, 60_000)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  if (!isSupabaseConfigured() || !process.env.CRYPTO_PAYMENT_API_KEY) return NextResponse.json({ error: "Checkout is not available yet." }, { status: 503 });
  if (/localhost|127\.0\.0\.1/.test(site.url)) return NextResponse.json({ error: "Site URL is not configured (set NEXT_PUBLIC_SITE_URL to your real https domain)." }, { status: 503 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const isIndicator = body.product === "indicator";
  const guest = typeof body.email === "string" && body.email.trim() !== "";
  const licenseId = typeof body.licenseId === "string" ? body.licenseId.trim() : "";
  const accessId = typeof body.accessId === "string" ? body.accessId.trim() : "";
  const renewing = isIndicator ? accessId : licenseId;
  // Signed-in customers (dashboard) use their account email; guests must type one.
  const user = guest && !renewing ? null : await getUser().catch(() => null);
  const email = sanitizeText((renewing ? user?.email : guest ? body.email : user?.email) || "", 254).toLowerCase();
  const db = supabaseAdmin();

  let renewId: string | null = null;
  let tvUsername: string | null = null;

  if (isIndicator) {
    if (!isPlanId(body.plan) || !indicatorPlanAvailable(body.plan)) return NextResponse.json({ error: "That plan is not available." }, { status: 400 });
    if (accessId) {
      // Renewal of ONE indicator access that belongs to the signed-in customer.
      if (!user?.email) return NextResponse.json({ error: "Sign in to renew." }, { status: 401 });
      if (!/^[0-9a-f-]{36}$/i.test(accessId)) return NextResponse.json({ error: "Access not found." }, { status: 404 });
      const { data: acc } = await db.from("indicator_access").select("id,customer_email,plan,status,tv_username").eq("id", accessId).maybeSingle();
      if (!acc || String(acc.customer_email).toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ error: "Access not found." }, { status: 404 });
      if (acc.plan !== "monthly") return NextResponse.json({ error: "Lifetime access never expires." }, { status: 400 });
      if (acc.status === "revoked") return NextResponse.json({ error: "This access was revoked. Please contact support." }, { status: 400 });
      renewId = acc.id as string;
      tvUsername = acc.tv_username as string;
      body.plan = "monthly";
    } else {
      tvUsername = sanitizeText(body.tvUsername, 40).replace(/^@/, "");
      if (!isTvUsername(tvUsername)) return NextResponse.json({ error: "Enter your TradingView username (letters, numbers and underscores, 3 to 30 characters)." }, { status: 400 });
    }
  } else if (licenseId) {
    // Renewal of ONE specific license: it must belong to the signed-in customer. The time is added to that same license.
    if (!user?.email) return NextResponse.json({ error: "Sign in to renew your license." }, { status: 401 });
    const { data: lic } = await db.from("licenses").select("id,customer_email,plan,status").eq("id", licenseId).maybeSingle();
    if (!lic || String(lic.customer_email).toLowerCase() !== user.email.toLowerCase()) return NextResponse.json({ error: "License not found." }, { status: 404 });
    if (lic.plan !== "monthly") return NextResponse.json({ error: "Lifetime licenses never expire, so there is nothing to renew." }, { status: 400 });
    if (lic.status === "revoked") return NextResponse.json({ error: "This license was revoked. Please contact support." }, { status: 400 });
    renewId = lic.id as string;
    body.plan = "monthly";
  }
  if (!isPlanId(body.plan) || !isValidEmail(email)) return NextResponse.json({ error: "Invalid plan or email." }, { status: 400 });

  const orderId = `ORD-${randomBytes(6).toString("hex").toUpperCase()}`; // unguessable
  const months = body.plan === "monthly" ? parseMonths(body.months) : 1;
  const amountUsd = isIndicator ? indicatorTotalUsd(body.plan, months) : orderTotalUsd(body.plan, months);
  const ins = await db.from("orders").insert({
    order_id: orderId, customer_email: email, plan: body.plan, amount_usd: amountUsd, coin: "CRYPTO", network: "CryptoPayr",
    ...(months > 1 ? { months } : {}),
    ...(isIndicator ? { product: INDICATOR_PRODUCT, tv_username: tvUsername, ...(renewId ? { renew_access_id: renewId } : {}) } : renewId ? { renew_license_id: renewId } : {}),
  });
  if (ins.error) return NextResponse.json({ error: "Could not create order." }, { status: 500 });

  try {
    const pay = await createPayment({
      orderId, amountUsd,
      successUrl: `${site.url}/checkout/success?order=${orderId}${renewId ? "&renew=1" : ""}${isIndicator ? "&product=indicator" : ""}`,
      cancelUrl: `${site.url}/checkout/cancelled?plan=${body.plan}${isIndicator ? "&product=indicator" : ""}${body.from === "dashboard" ? "&from=dashboard" : ""}`,
      webhookUrl: `${site.url}/api/webhooks/crypto`,
    });
    await db.from("orders").update({ provider_ref: pay.tid }).eq("order_id", orderId);
    return NextResponse.json({ orderId, checkoutUrl: pay.checkoutUrl });
  } catch (e) {
    console.error("createPayment failed", e);
    await db.from("orders").update({ order_status: "failed" }).eq("order_id", orderId);
    return NextResponse.json({ error: "Could not start the payment. Please try again shortly." }, { status: 502 });
  }
}
