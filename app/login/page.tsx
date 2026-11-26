import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForms } from "@/components/auth/AuthForms";
import { LicenseCard } from "@/components/dashboard/LicenseCard";
import { Logo } from "@/components/ui/Logo";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const POINTS: [string, string][] = [
  ["Your license, ready after payment", "It appears in your dashboard as soon as your crypto payment is confirmed."],
  ["Renew in a few taps", "Extend the same license without buying again."],
  ["Protected sign-in", "Strong passwords, emailed one-time codes and automatic lockout."],
];

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (configured && (await getUser())) redirect(safeNext);

  const sample = { id: "sample", license_ref: "LIC-7K2M9QXA", plan: "monthly" as const, start_date: new Date().toISOString(), expiration_date: new Date(Date.now() + 25 * 86_400_000).toISOString(), mt5_account: "12345678", state: "active" as const };

  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-forest via-[#0F2A1F] to-bg p-12 lg:flex">
        <svg className="pointer-events-none absolute -bottom-40 -left-32 h-[560px] w-[560px] opacity-[.08]" viewBox="0 0 200 200" fill="none" stroke="#00E59B" strokeWidth=".5" aria-hidden="true">{[95, 80, 65, 50, 35, 20].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}</svg>
        <Link href="/" aria-label="3MIN SCALP home" className="relative"><Logo /></Link>
        <div className="relative max-w-[480px]">
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">Your EA, licenses and tools in one secure place.</h2>
          <div className="mt-9 -rotate-2"><LicenseCard l={sample} size="lg" /></div>
          <p className="mt-3 text-xs text-ink/50">Sample card. Yours shows your own license, MT5 account and expiry.</p>
          <ul className="mt-9 space-y-4">
            {POINTS.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
                <div><p className="text-[15px] font-semibold">{t}</p><p className="text-sm leading-relaxed text-ink/60">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative max-w-[480px] text-xs leading-relaxed text-ink/45">Trading involves risk. Past performance does not guarantee future results.</p>
      </aside>

      <div className="relative flex min-h-screen flex-col">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(0,229,155,0.10),transparent)] lg:hidden" />
        <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" aria-label="3MIN SCALP home" className="lg:invisible"><Logo /></Link>
          <Link href="/" className="text-sm text-muted hover:text-ink">← Back to website</Link>
        </header>
        <main className="relative flex flex-1 items-center justify-center px-5 pb-12 pt-2 sm:px-8">
          <div className="w-full max-w-[440px]">
            <div className="rounded-[28px] border border-line bg-bg2 p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)] sm:p-9">
              {error && <p role="alert" className="mb-5 rounded-2xl border border-red-400/30 bg-red-400/10 p-3.5 text-sm text-red-200">Sign-in could not be completed. Please try again, or use your email and password.</p>}
              {configured ? <AuthForms next={safeNext} google={process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1"} /> : (
                <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">Sign-in is not configured yet. Add the Supabase environment variables in Vercel and redeploy.</p>
              )}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted">
              By continuing you agree to our <Link href="/terms" className="underline hover:text-ink">Terms</Link> and <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>. Need help? <Link href="/contact" className="underline hover:text-ink">Contact support</Link>.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
