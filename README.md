# 3MIN SCALP website

Next.js 15 (App Router) + TypeScript + Tailwind CSS. Crypto-only checkout, demo/preview mode, ready for Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Demo / preview mode
`NEXT_PUBLIC_DEMO_MODE=true` (default). All performance numbers are labeled DEMO / ILLUSTRATIVE and carry the
"illustrative only" notice. Set it to `false` only after real, verified data replaces `lib/data/performance.ts`.

## Fill in placeholders before launch
| What | Where |
|---|---|
| Business email, socials | `NEXT_PUBLIC_BUSINESS_EMAIL`, `NEXT_PUBLIC_*_URL` |
| Legal name/address/date | `lib/config/site.ts` (`legal`) |
| Refund policy text | `NEXT_PUBLIC_REFUND_POLICY_TEXT` or `lib/config/legal.ts` |
| CryptoPayr key + webhook | Vercel env vars, see SETUP.md |
| Terms / Privacy bracketed items | `app/terms`, `app/privacy` (have a lawyer review) |

> Backend (Supabase database, login, licenses, admin, secure downloads): see **SETUP.md**.

## Not connected yet (by design)
Auth, database, payment provider + webhook, email, secure download, support tickets, and the admin panel are
architecture only. Dashboard/admin pages show empty states, not fake data. Stubs: `app/api/*`, `lib/payments`,
`lib/licensing`, `lib/email/templates.ts`. Payment status must come from a verified webhook, never an "I have paid" click.
The EX5 must be served from private storage via signed, short-lived URLs after license validation.
Note: a compiled EX5 cannot enforce licensing by itself; account/expiry checks must be built into the EA.

## Deploy to Vercel
1. Push to GitHub, then Vercel → Add New Project → import the repo (framework: Next.js, build `next build`).
2. Add environment variables from `.env.example` (secrets server-only, no `NEXT_PUBLIC_` prefix).
3. Deploy. HTTPS is automatic.
4. Domain: Project → Settings → Domains → add your domain, set the DNS records Vercel shows, then set `NEXT_PUBLIC_SITE_URL`.
5. Submit `/sitemap.xml` in Google Search Console.
