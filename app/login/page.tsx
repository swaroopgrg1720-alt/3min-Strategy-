import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

const steps = ["Enter the email you purchased with", "Open the email we send you", "Click the link. It works only once"];

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_50%_0%,rgba(0,229,155,0.12),transparent),radial-gradient(40%_40%_at_100%_100%,rgba(18,61,50,0.4),transparent)]" />
      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" aria-label="3MIN SCALP home"><Logo /></Link>
        <Link href="/" className="text-sm text-muted hover:text-ink">← Back to website</Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-5 pb-16 pt-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-line bg-bg2/80 p-7 shadow-glow backdrop-blur sm:p-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-bg" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">Sign in to your account</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">No password needed. We email you a secure, one-time link that signs you in.</p>

            {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">That link has already been used or has expired. Please request a new one.</p>}
            {configured ? <LoginForm next={safeNext} /> : (
              <p role="status" className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">Sign-in is not configured yet. Add the Supabase environment variables in Vercel and redeploy.</p>
            )}

            <ol className="mt-8 space-y-3 border-t border-line pt-6">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm text-muted">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/40 text-xs font-semibold text-accent">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            By continuing you agree to our <Link href="/terms" className="underline hover:text-ink">Terms</Link> and <Link href="/privacy" className="underline hover:text-ink">Privacy Policy</Link>. Need help? <Link href="/contact" className="underline hover:text-ink">Contact support</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
