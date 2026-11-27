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


## Live chat
1. Supabase → SQL editor → run `supabase/migrations/006_chat.sql` once.
2. Chat appears as a green bubble on the site. Replies are written in **Admin → Live chat**.
3. Email alerts (optional): create a free account at resend.com, then in Vercel add `EMAIL_API_KEY` (Resend key) and `EMAIL_FROM` (e.g. `3MIN SCALP <support@yourdomain.com>`, domain must be verified in Resend). You get an email at every address in `ADMIN_EMAILS` when a visitor writes (at most one per 10 minutes per conversation), and visitors who left an email get one when you reply while away.
4. Without the email variables chat still works; you just won't get alerts, so open Admin → Live chat to check (the menu shows an unread badge).

### Automatic replies
Run `supabase/migrations/007_chat_auto.sql` once. Visitors then get an instant, pre-written answer for common questions (price, payment, license, download, renewal, refund, risk) and a "we received your message" note otherwise. Nothing is sent automatically for 3 hours after you reply yourself. Edit the wording in `lib/chat/autoreply.ts`.

## Login, passwords and security
Customers now sign in with **email + password**. Forgot password and email confirmation use a **6-digit code** sent by email.

1. Supabase → SQL editor → run `supabase/migrations/008_auth_throttle.sql` (locks brute-force attempts).
2. Supabase → Authentication → Sign In / Providers → Email: keep **Confirm email ON**, set **Minimum password length to 12**, and turn on **Prevent use of leaked passwords** if your plan offers it.
3. Supabase → Authentication → Email Templates: paste the templates from `supabase/email-templates/README.md` into **Confirm signup** and **Reset password** (they must contain `{{ .Token }}`).
4. Supabase → Authentication → Emails → SMTP Settings: add a custom SMTP (Resend works: host `smtp.resend.com`, port 465, user `resend`, password = your Resend API key). The built-in sender only allows a few emails per hour, so codes will fail without this.
5. Supabase → Authentication → Sign In / Providers → Email → set **Email OTP expiration** to 600 seconds (10 minutes).
6. Existing customers have no password yet: they open the sign-in page, choose **Forgot password**, enter the code, and set one.
7. In the account page customers can change their password and sign out on all devices.

## Sign in with Google (optional)
1. console.cloud.google.com → create a project → APIs & Services → OAuth consent screen (External, app name 3MIN SCALP, your email) → Publish.
2. Credentials → Create credentials → OAuth client ID → Web application. Under Authorized redirect URIs add `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`. Copy the Client ID and Client secret.
3. Supabase → Authentication → Sign In / Providers → Google → turn on, paste Client ID and Client secret, Save.
4. Supabase → Authentication → URL Configuration → Site URL = your website address; add `https://YOUR-SITE/**` to Redirect URLs.
5. Vercel → Environment Variables → `NEXT_PUBLIC_GOOGLE_LOGIN` = `1`, then redeploy. The Google button appears on the sign-in page.
Google accounts are matched to licenses by email, so customers who bought with their Gmail see their licenses immediately.

## TradingView indicator (second product)

1. The database part (migration `009_indicator.sql`) is already applied to your Supabase project.
2. In Vercel, Settings, Environment Variables, add these (then redeploy):
   - `NEXT_PUBLIC_INDICATOR_NAME` (default "3MIN SCALP Indicator")
   - `NEXT_PUBLIC_INDICATOR_TAGLINE` (one line shown under the name)
   - `NEXT_PUBLIC_INDICATOR_MONTHLY_USD` (for example 19). Leave empty to hide the monthly plan.
   - `NEXT_PUBLIC_INDICATOR_LIFETIME_USD` (for example 99). Leave empty to hide the lifetime plan.
   With no price set, the indicator shows "Soon" and cannot be bought.
3. After a customer pays you get an email (and an entry in Admin, Indicator). Open your script on TradingView, Manage access, add their username, then press "Mark as granted" in Admin.
