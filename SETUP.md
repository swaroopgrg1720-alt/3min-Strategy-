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
| `CRYPTO_WEBHOOK_SECRET`, `CRYPTO_PAYMENT_API_KEY` | from your payment provider, when chosen |

Redeploy after adding variables.

## 3. Go live checklist
1. Open `/login`, sign in with your admin email (magic link), then open `/admin`.
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

## 5. The EA license check: read this
`/api/license/validate` is ready, but **an EX5 cannot be modified without its MQ5 source.** Today that means:
- ✅ Access control to the *download* works (only paying customers get the file).
- ❌ Nothing stops a paying customer sharing the EX5 file, and the EA itself won't check keys.

To enforce licenses and bind an MT5 account, the check must be compiled into the EA by whoever has the source (you, or the developer who wrote it). Ask for a version that calls the endpoint. Reference snippet for them:

```mql5
// Terminal: Tools > Options > Expert Advisors > "Allow WebRequest for listed URL" -> https://YOUR-DOMAIN
bool CheckLicense(const string key)
{
   string nonce = IntegerToString((long)TimeLocal()) + IntegerToString(MathRand());
   string body  = "{\"key\":\"" + key + "\",\"account\":\"" + IntegerToString((long)AccountInfoInteger(ACCOUNT_LOGIN)) +
                  "\",\"nonce\":\"" + nonce + "\"}";
   char post[], result[]; string headers = "Content-Type: application/json\r\n", rh;
   StringToCharArray(body, post, 0, StringLen(body));
   int code = WebRequest("POST", "https://YOUR-DOMAIN/api/license/validate", headers, 5000, post, result, rh);
   if(code != 200) return false;                       // fail closed
   string r = CharArrayToString(result);
   return StringFind(r, "\"valid\":true") >= 0 && StringFind(r, "\"nonce\":\"" + nonce + "\"") >= 0;
}
// Call in OnInit() and again every few hours; stop trading if it returns false.
```
Also check the reply `sig` (HMAC-SHA256 of `valid|reason|expires|nonce|ts` with `LICENSE_RESPONSE_SECRET`) if you embed that secret; note that anything inside an EX5 can eventually be extracted, so treat client-side checks as deterrence, not absolute protection.

## 6. Known limits / next steps
- Rate limiting is in-memory (per server instance). For stronger protection use Upstash Redis/Vercel KV.
- Confirmation emails are stubbed (`lib/email/templates.ts`); add an email provider.
- Verify the **paid amount and coin** inside your provider's webhook before confirming.
- Customers can't unbind their MT5 account themselves; use *Unbind account* in `/admin` after a support request.
