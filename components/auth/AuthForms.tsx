"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { sendCode, setNewPassword, signIn, signUp, verifyCode, type R } from "@/app/login/actions";
import { PASSWORD_RULES, passwordScore } from "@/lib/auth/password";

type Mode = "signin" | "signup" | "forgot" | "verify" | "newpw";
type Kind = "signup" | "recovery";

const field = "min-h-[50px] w-full rounded-xl border border-line bg-bg px-4 text-[16px] text-ink placeholder:text-muted/60 focus:border-accent/70 focus:outline-none";
const primary = "inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-accent px-6 text-[15px] font-semibold text-bg active:brightness-95 disabled:opacity-60";
const link = "text-sm font-semibold text-accent active:opacity-70";

function PasswordInput({ id, value, onChange, autoComplete, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} required maxLength={128}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} className={`${field} pr-20`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-sm font-semibold text-muted active:bg-forest/40">{show ? "Hide" : "Show"}</button>
    </div>
  );
}

function Strength({ value }: { value: string }) {
  const score = passwordScore(value);
  const tone = score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-300" : "bg-accent";
  const label = !value ? "" : score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Strong" : "Very strong";
  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 rounded-full ${value && score >= n ? tone : "bg-line"}`} />)}</div>
        <span className="w-20 text-right text-xs font-semibold text-muted">{label}</span>
      </div>
      <ul className="mt-3 grid gap-1.5 text-[13px]">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(value);
          return <li key={r.id} className={`flex items-center gap-2 ${ok ? "text-accent" : "text-muted"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${ok ? "border-accent bg-accent text-bg" : "border-line"}`} aria-hidden="true">{ok ? "✓" : ""}</span>{r.label}</li>;
        })}
      </ul>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function AuthForms({ next = "/dashboard", google = false }: { next?: string; google?: boolean }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [kind, setKind] = useState<Kind>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const go = (m: Mode) => { setMode(m); setError(""); setInfo(""); setCode(""); };
  const done = (to?: string) => window.location.assign(to || next);

  async function run(fn: () => Promise<R>, onOk: (r: Extract<R, { ok: true }>) => void, onFail?: (r: Extract<R, { ok: false }>) => void) {
    setBusy(true); setError(""); setInfo("");
    try {
      const r = await fn();
      if (r.ok) onOk(r); else { setError(r.error); onFail?.(r); }
    } catch { setError("Something went wrong. Check your connection and try again."); } finally { setBusy(false); }
  }

  const startVerify = (k: Kind) => { setKind(k); setMode("verify"); setCode(""); setCooldown(45); setInfo(`We sent a code to ${email.trim()}. It expires soon.`); };

  const onSignIn = (e: React.FormEvent) => { e.preventDefault(); void run(() => signIn(email, password, next), (r) => done(r.next),
    (r) => { if (r.needsVerify) { void sendCode(email, "signup"); startVerify("signup"); setError(r.error); setInfo(""); } }); };
  const onSignUp = (e: React.FormEvent) => { e.preventDefault(); void run(() => signUp(email, password), () => startVerify("signup")); };
  const onForgot = (e: React.FormEvent) => { e.preventDefault(); void run(() => sendCode(email, "recovery"), () => startVerify("recovery")); };
  const onVerify = (e: React.FormEvent) => { e.preventDefault(); void run(() => verifyCode(email, code, kind, next), (r) => { if (kind === "signup") done(r.next); else { setMode("newpw"); setPassword(""); setError(""); setInfo("Code accepted. Choose a new password."); } }); };
  const onNewPw = (e: React.FormEvent) => { e.preventDefault(); void run(() => setNewPassword(password, next), (r) => done(r.next)); };
  const resend = () => { if (cooldown > 0 || busy) return; void run(() => sendCode(email, kind), () => { setCooldown(45); setInfo("A new code is on its way."); }); };

  const Alert = () => (<>
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
    {info && <p role="status" className="mt-4 rounded-xl border border-accent/30 bg-forest/30 p-3 text-sm text-ink">{info}</p>}
  </>);

  const tabs = mode === "signin" || mode === "signup";

  async function withGoogle() {
    setBusy(true); setError(""); setInfo("");
    const { error: e } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (e) { setError("Google sign-in is not available right now. Use your email and password."); setBusy(false); }
  }
  const GoogleButton = () => !google ? null : (
    <div className="mt-5">
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
      <button type="button" onClick={withGoogle} disabled={busy} className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-3 rounded-full border border-line bg-bg px-6 text-[15px] font-semibold text-ink active:bg-forest/40 disabled:opacity-60">
        <GoogleG />{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
      </button>
    </div>
  );

  return (
    <div className="mt-6">
      {tabs && (
        <div className="grid grid-cols-2 gap-1.5 rounded-full border border-line bg-bg p-1" role="tablist">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => go(m)}
              className={`min-h-[44px] rounded-full text-sm font-semibold ${mode === m ? "bg-accent text-bg" : "text-muted"}`}>{m === "signin" ? "Sign in" : "Create account"}</button>
          ))}
        </div>
      )}

      {mode === "signin" && (
        <form onSubmit={onSignIn} className="mt-5 space-y-4">
          <div><label htmlFor="em" className="text-sm font-medium">Email address</label>
            <input id="em" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`${field} mt-2`} /></div>
          <div><div className="flex items-center justify-between"><label htmlFor="pw" className="text-sm font-medium">Password</label>
            <button type="button" className={link} onClick={() => go("forgot")}>Forgot password?</button></div>
            <div className="mt-2"><PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="current-password" /></div></div>
          <button className={primary} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <Alert />
        </form>
      )}
      {mode === "signin" && <GoogleButton />}

      {mode === "signup" && (
        <form onSubmit={onSignUp} className="mt-5 space-y-4">
          <p className="text-sm text-muted">Use the same email you bought with, so your licenses appear automatically.</p>
          <div><label htmlFor="em2" className="text-sm font-medium">Email address</label>
            <input id="em2" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={`${field} mt-2`} /></div>
          <div><label htmlFor="pw2" className="text-sm font-medium">Create a password</label>
            <div className="mt-2"><PasswordInput id="pw2" value={password} onChange={setPassword} autoComplete="new-password" /></div>
            <Strength value={password} /></div>
          <button className={primary} disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
          <Alert />
        </form>
      )}
      {mode === "signup" && <GoogleButton />}

      {mode === "forgot" && (
        <form onSubmit={onForgot} className="mt-1 space-y-4">
          <button type="button" className={link} onClick={() => go("signin")}>‹ Back to sign in</button>
          <h2 className="font-display text-xl font-semibold">Reset your password</h2>
          <p className="text-sm text-muted">Enter your email. We will send a one-time code to confirm it is you.</p>
          <input type="email" required autoComplete="email" inputMode="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
          <button className={primary} disabled={busy}>{busy ? "Sending…" : "Send code"}</button>
          <Alert />
        </form>
      )}

      {mode === "verify" && (
        <form onSubmit={onVerify} className="mt-1 space-y-4">
          <button type="button" className={link} onClick={() => go(kind === "signup" ? "signup" : "forgot")}>‹ Use a different email</button>
          <h2 className="font-display text-xl font-semibold">{kind === "signup" ? "Confirm your email" : "Enter your reset code"}</h2>
          <p className="text-sm text-muted">Type the code from the email we sent to <span className="text-ink">{email.trim()}</span>. Check your spam folder too.{kind === "signup" && " Already bought before? You may already have an account: go back to Sign in and choose Forgot password."}</p>
          <input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={10} required aria-label="Verification code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000" className={`${field} text-center font-mono text-2xl tracking-[0.4em]`} />
          <button className={primary} disabled={busy || code.length < 6}>{busy ? "Checking…" : kind === "signup" ? "Verify and continue" : "Verify code"}</button>
          <button type="button" onClick={resend} disabled={cooldown > 0 || busy} className="w-full text-sm font-semibold text-accent disabled:text-muted">{cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}</button>
          <Alert />
        </form>
      )}

      {mode === "newpw" && (
        <form onSubmit={onNewPw} className="mt-1 space-y-4">
          <h2 className="font-display text-xl font-semibold">Choose a new password</h2>
          <div><PasswordInput id="npw" value={password} onChange={setPassword} autoComplete="new-password" placeholder="New password" /><Strength value={password} /></div>
          <button className={primary} disabled={busy}>{busy ? "Saving…" : "Save password and sign in"}</button>
          <p className="text-xs text-muted">Saving a new password also signs you out on your other devices.</p>
          <Alert />
        </form>
      )}
    </div>
  );
}
