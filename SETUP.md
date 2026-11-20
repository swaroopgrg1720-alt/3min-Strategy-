# Backend setup: Supabase, licenses, admin

## 1. Supabase (free tier is fine)
1. Create a project at supabase.com.
2. SQL Editor → paste `supabase/migrations/001_init.sql` → Run.
3. Storage → confirm a **private** bucket named `ea-files` exists (the SQL creates it). Upload your `.ex5` there.
4. Authentication → URL Configuration: set **Site URL** to your site and add `https://YOUR-DOMAIN/auth/callback` (and your `*.vercel.app` URL) to **Redirect URLs**.
5. Project Settings → API: copy the URL, `anon` key and `service_role` key.

## 2. Environment variables (Vercel → Settings → Environment Variables)
| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase. **Server-only. Never share or commit.** |
| `LICENSE_KEY_PEPPER`, `LICENSE_ENCRYPTION_KEY`, `LICENSE_RESPONSE_SECRET` | three different values, each from `openssl rand -base64 32` (any 32-byte base64 string works). **Back them up: losing the encryption key makes stored keys unreadable.** |
| `ADMIN_EMAILS` | your email (comma-separate more) |
| `CRYPTO_PAYMENT_API_KEY` | your CryptoPayr secret key (`sk_live_…`; use `sk_test_…` to test). **Server-only.** Also verifies webhook signatures. |
| `CRYPTO_WEBHOOK_SECRET` | optional, only if CryptoPayr gives a separate webhook secret |
| `NEXT_PUBLIC_SITE_URL` | your real `https://` site address (not localhost), because CryptoPayr redirects customers and sends webhooks there |

**CryptoPayr:** in its dashboard set the webhook URL to `https://YOUR-DOMAIN/api/webhooks/crypto`. Checkout redirects to CryptoPayr; the license is issued when the signed `COMPLETED` webhook arrives. Webhooks are sent once (no retries): if one is missed, open Admin → Orders → **Check with CryptoPayr**. Check in CryptoPayr's settings where funds are held and how you withdraw them before going live.

Redeploy after adding variables.

## 2b. Trading journal (customer tool)
Run `supabase/migrations/002_journal.sql` in the SQL Editor (after 001). Customers then get **Trading Journal** and **Trading Tools** in their dashboard. Each customer's journal is private to them (Row Level Security).

## 3. Go live checklist
1. Open `/admin/login` → **Create admin account** (email must match `ADMIN_EMAILS`, pick a password of 10+ characters). Next time use **Sign in**. No email confirmation needed.
2. **Products** → enter version + file path of the EX5 in the bucket → *Publish as current*.
3. **Licenses** → create a test license for your own email → sign in as that email → `/dashboard/license` → *Show license key*, and `/dashboard/downloads` to test the download.
4. Configure real networks and a payment provider (`lib/config/payments.ts`, `lib/payments/provider.ts`) and point the provider webhook to `https://YOUR-DOMAIN/api/webhooks/crypto`.
   Until then, orders appear in `/admin → Orders`; after **verifying the payment on-chain yourself** press *Confirm paid & issue license*.

## 4. How it works
- Order created (`/api/checkout`, price taken server-side) → payment confirmed by signed webhook or admin → `fulfil_order()` runs in one locked database transaction (duplicate webhooks cannot create two licenses; a second monthly purchase renews the existing license by 30 days).
- Keys look like `3MS-XXXXX-XXXXX-XXXXX-XXXXX`. Only an HMAC hash is used for checks; an AES-256-GCM copy lets the owner view their key. Customers cannot read these columns directly (column-level grants + RLS).
- Customers sign in with an email link; they only ever see rows matching their own verified email.
- Downloads: login → active license check → 60-second signed URL from the private bucket → logged.
- Admin: every page and action re-checks `ADMIN_EMAILS` on the server.

## 5. EA keys (offline scheme from your `keygen.py`)
The site generates keys in exactly the format of your `keygen.py`:
`<YYYYMMDD expiry>-<first 20 hex of SHA256("SALT|mt5_account|expiry")>`; verified identical to the script.

1. In Vercel add `EA_SECRET_SALT` = the **same** salt compiled into your EA (the real one, not the placeholder in `keygen.py`). Never put it in GitHub or chat.
2. After a license exists (paid order or admin-created), the customer opens **Dashboard → My License**, enters their MT5 account number once, and gets their key. The license then locks to that account.
3. Lifetime = expiry `20991231`. Monthly = the license expiration date; each renewal (+30 days) changes the expiry, so the customer copies a new key from the dashboard.
4. To move a customer to another account, press **Unbind account** in `/admin`.

The old online check (`/api/license/validate`) is still there if you later want a server check in the EA; your offline scheme does not need it.

## 6. Known limits / next steps
- Rate limiting is in-memory (per server instance). For stronger protection use Upstash Redis/Vercel KV.
- Confirmation emails are stubbed (`lib/email/templates.ts`); add an email provider.
- Verify the **paid amount and coin** inside your provider's webhook before confirming.
- Customers can't unbind their MT5 account themselves; use *Unbind account* in `/admin` after a support request.

## Multi-month purchases
Run `supabase/migrations/004_months.sql` once in the Supabase SQL editor. Without it, 1-month and lifetime purchases still work, but orders for 2+ months will fail until it is run.

## Renewals
Run `supabase/migrations/005_renew.sql` once in the Supabase SQL editor. After that, **Renew** on a license adds the paid months to that same license, and a normal purchase always creates a new license (one license per MT5 account).
