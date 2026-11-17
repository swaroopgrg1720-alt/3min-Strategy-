import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const features = [
  { t: "License & secure downloads", d: "View your license and download 3MIN SCALP through short-lived, protected links.", i: "M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6l-8-3Zm-1 12-3-3 1.4-1.4L11 12.2l3.6-3.6L16 10l-5 5Z" },
  { t: "Trading journal", d: "Log every trade and review win rate, profit factor, drawdown and your equity curve.", i: "M6 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6V3Zm2 4v2h6V7H8Zm0 4v2h6v-2H8Zm0 4v2h4v-2H8Z" },
  { t: "Risk & position tools", d: "Position size, risk/reward, profit/loss and drawdown-recovery calculators.", i: "M4 19V9h3v10H4Zm6 0V5h3v14h-3Zm6 0v-7h3v7h-3Z" },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <section className="relative overflow-hidden py-10 sm:py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(0,229,155,0.10),transparent),radial-gradient(40%_40%_at_100%_100%,rgba(18,61,50,0.35),transparent)]" />
      <div className="container-x">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-bg2/70 shadow-glow lg:grid-cols-[1.1fr_1fr]">
          {/* Brand panel (desktop) */}
          <aside className="relative hidden flex-col justify-between border-r border-line bg-gradient-to-br from-forest/40 via-bg2 to-bg p-10 lg:flex">
            <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full opacity-60" viewBox="0 0 400 200" preserveAspectRatio="none">
              <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00E59B" stopOpacity="0.25" /><stop offset="1" stopColor="#00E59B" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 150 L50 128 L95 142 L150 96 L205 112 L260 62 L320 80 L400 28 L400 200 L0 200Z" fill="url(#lg)" />
              <path d="M0 150 L50 128 L95 142 L150 96 L205 112 L260 62 L320 80 L400 28" fill="none" stroke="#00E59B" strokeOpacity="0.6" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <div className="relative">
              <Link href="/" aria-label="3MIN SCALP home"><Logo /></Link>
              <h1 className="mt-10 text-3xl font-bold leading-tight tracking-tight">Your trading workspace, <span className="text-accent">in one place.</span></h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">Access your license, download your Expert Advisor and use tools built to keep your trading organised.</p>
              <ul className="mt-8 space-y-5">
                {features.map((f) => (
                  <li key={f.t} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-bg/60 text-accent" aria-hidden="true">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d={f.i} /></svg>
                    </span>
                    <span><span className="block text-sm font-semibold">{f.t}</span><span className="mt-0.5 block text-sm leading-relaxed text-muted">{f.d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="relative mt-10 text-xs text-muted">Trading involves substantial risk. Tools are educational and do not guarantee results.</p>
          </aside>

          {/* Form */}
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="lg:hidden"><Link href="/" aria-label="3MIN SCALP home"><Logo /></Link></div>
            <h2 className="mt-8 text-2xl font-bold tracking-tight lg:mt-0 lg:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-muted">Sign in to your 3MIN SCALP account.</p>
            {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">That sign-in link is invalid or has expired. Please request a new one.</p>}
            {configured ? <LoginForm next={safeNext} /> : (
              <p role="status" className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">Sign-in is not configured yet. Add the Supabase environment variables in Vercel and redeploy.</p>
            )}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Encrypted, passwordless sign-in</span>
              <Link href="/contact" className="hover:text-ink">Need help?</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
