"use client";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { sendCode, setNewPassword, signIn, signUp, verifyCode, type R } from "@/app/login/actions";
import { PASSWORD_RULES, passwordScore } from "@/lib/auth/password";

type Mode = "signin" | "signup" | "forgot" | "verify" | "newpw" | "done";
type Kind = "signup" | "recovery";

const field = "min-h-[54px] w-full rounded-2xl border border-line bg-bg pl-12 pr-4 text-[16px] text-ink placeholder:text-muted/60 transition-colors focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/20";
const primary = "inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 text-[15px] font-semibold text-bg shadow-[0_10px_28px_-10px_rgba(0,229,155,.55)] active:brightness-95 disabled:opacity-60 disabled:shadow-none";
const linkBtn = "text-sm font-semibold text-accent active:opacity-70";

const Svg = ({ d, size = 20 }: { d: string[]; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d.map((p) => <path key={p} d={p} />)}</svg>
);
const ICON = { mail: ["M3 6h18v12H3z", "m3 7 9 7 9-7"], lock: ["M6 11h12v9H6z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"], shield: ["M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6z", "m9 12 2 2 4-4"], back: ["M15 5l-7 7 7 7"] };

function Spinner() {
  return <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function Labeled({ id, label, icon, right, children }: { id: string; label: string; icon: string[]; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between"><label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>{right}</div>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"><Svg d={icon} /></span>
        {children}
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <>
      <input id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} required maxLength={128}
        autoCapitalize="none" autoCorrect="off" spellCheck={false} className={`${field} pr-20`} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-3 py-2 text-sm font-semibold text-muted active:bg-forest/40">{show ? "Hide" : "Show"}</button>
    </>
  );
}

function Strength({ value }: { value: string }) {
  const score = passwordScore(value);
  const tone = score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-300" : "bg-accent";
  const label = !value ? "" : score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Strong" : "Very strong";
  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 rounded-full transition-colors duration-300 ${value && score >= n ? tone : "bg-line"}`} />)}</div>
        <span className="w-20 text-right text-xs font-semibold text-muted">{label}</span>
      </div>
      <ul className="mt-3 grid gap-1.5 text-[13px] sm:grid-cols-2">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(value);
          return <li key={r.id} className={`flex items-center gap-2 transition-colors ${ok ? "text-accent" : "text-muted"}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${ok ? "border-accent bg-accent text-bg" : "border-line"}`} aria-hidden="true">{ok ? "✓" : ""}</span>{r.label}</li>;
        })}
      </ul>
    </div>
  );
}

/** Six separate boxes. Supports typing, backspace, paste and autofill; submits itself when the sixth digit lands. */
function CodeInput({ value, onChange, onComplete, disabled }: { value: string; onChange: (v: string) => void; onComplete: (v: string) => void; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const set = (raw: string) => { const v = raw.replace(/\D/g, "").slice(0, 6); onChange(v); if (v.length === 6) onComplete(v); return v; };
  useEffect(() => { refs.current[0]?.focus(); }, []);
  return (
    <div className="grid grid-cols-6 gap-2" role="group" aria-label="6-digit code" onPaste={(e) => { e.preventDefault(); const v = set(e.clipboardData.getData("text")); refs.current[Math.min(v.length, 5)]?.focus(); }}>
      {digits.map((d, i) => (
        <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} disabled={disabled} inputMode="numeric" pattern="[0-9]*" maxLength={i === 0 ? 6 : 1}
          autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`} onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (raw.length > 1) { const v = set(raw); refs.current[Math.min(v.length, 5)]?.focus(); return; }
            const arr = digits.slice(); arr[i] = raw; set(arr.join(""));
            if (raw && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus(); }}
          className="aspect-[4/5] w-full min-w-0 rounded-2xl border border-line bg-bg text-center font-mono text-2xl font-semibold text-ink transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60" />
      ))}
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

function Head({ title, text }: { title: string; text: string }) {
  return (<div className="mb-6"><h1 className="font-display text-[28px] font-bold leading-tight tracking-tight sm:text-3xl">{title}</h1><p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p></div>);
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
  const [doneText, setDoneText] = useState("");
  const finished = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  const go = (m: Mode) => { setMode(m); setError(""); setInfo(""); setCode(""); };
  const finish = (title: string, to?: string) => { finished.current = true; setDoneText(title); setMode("done"); setBusy(true); window.setTimeout(() => window.location.assign(to || next), 1100); };

  async function run(fn: () => Promise<R>, onOk: (r: Extract<R, { ok: true }>) => void, onFail?: (r: Extract<R, { ok: false }>) => void) {
    setBusy(true); setError(""); setInfo("");
    try {
      const r = await fn();
      if (r.ok) onOk(r); else { setError(r.error); onFail?.(r); }
    } catch { setError("Something went wrong. Check your connection and try again."); } finally { if (!finished.current) setBusy(false); }
  }

  const startVerify = (k: Kind) => { setKind(k); setMode("verify"); setCode(""); setCooldown(45); setInfo(`We sent a 6-digit code to ${email.trim()}.`); };
  const verify = (c: string) => { if (busy) return; void run(() => verifyCode(email, c, kind, next), (r) => {
    if (kind === "signup") finish("Email confirmed", r.next); else { setMode("newpw"); setPassword(""); setError(""); setInfo("Code accepted. Choose a new password."); } },
    () => setCode("")); };

  const onSignIn = (e: React.FormEvent) => { e.preventDefault(); void run(() => signIn(email, password, next), (r) => finish("Signed in", r.next),
    (r) => { if (r.needsVerify) { void sendCode(email, "signup"); startVerify("signup"); setError(r.error); setInfo(""); } }); };
  const onSignUp = (e: React.FormEvent) => { e.preventDefault(); void run(() => signUp(email, password), () => startVerify("signup")); };
  const onForgot = (e: React.FormEvent) => { e.preventDefault(); void run(() => sendCode(email, "recovery"), () => startVerify("recovery")); };
  const onNewPw = (e: React.FormEvent) => { e.preventDefault(); void run(() => setNewPassword(password, next), (r) => finish("Password updated", r.next)); };
  const resend = () => { if (cooldown > 0 || busy) return; void run(() => sendCode(email, kind), () => { setCooldown(45); setInfo("A new code is on its way."); }); };

  async function withGoogle() {
    setBusy(true); setError(""); setInfo("");
    const { error: e } = await supabaseBrowser().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (e) { setError("Google sign-in is not available right now. Use your email and password."); setBusy(false); }
  }

  const Alert = () => (<>
    {error && <p role="alert" className="mt-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-3.5 text-sm text-red-200">{error}</p>}
    {info && <p role="status" className="mt-4 rounded-2xl border border-accent/25 bg-forest/30 p-3.5 text-sm text-ink">{info}</p>}
  </>);
  const Go = ({ children, label }: { children: React.ReactNode; label?: string }) => (<button className={primary} disabled={busy} aria-label={label}>{busy && <Spinner />}{children}</button>);
  const GoogleBlock = () => !google ? null : (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or continue with<span className="h-px flex-1 bg-line" /></div>
      <button type="button" onClick={withGoogle} disabled={busy} className="mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-3 rounded-full border border-line bg-bg px-6 text-[15px] font-semibold text-ink active:bg-forest/40 disabled:opacity-60"><GoogleG />Google</button>
    </div>
  );
  const Back = ({ to, label }: { to: Mode; label: string }) => (<button type="button" className={`${linkBtn} mb-4 inline-flex items-center gap-1`} onClick={() => go(to)}><Svg d={ICON.back} size={16} />{label}</button>);

  const emailField = (id: string) => (
    <Labeled id={id} label="Email address" icon={ICON.mail}>
      <input id={id} type="email" required autoComplete="email" inputMode="email" autoCapitalize="none" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
    </Labeled>
  );
  const signupFlow = mode === "signup" || (mode === "verify" && kind === "signup");

  return (
    <div>
      {signupFlow && (
        <div className="mb-5" aria-label="Sign-up progress">
          <div className="grid grid-cols-2 gap-2"><span className="h-1.5 rounded-full bg-accent" /><span className={`h-1.5 rounded-full transition-colors duration-300 ${mode === "verify" ? "bg-accent" : "bg-line"}`} /></div>
          <p className="mt-2 text-xs font-medium text-muted">Step {mode === "verify" ? 2 : 1} of 2: {mode === "verify" ? "Confirm your email" : "Create your account"}</p>
        </div>
      )}

      <div key={mode} className="auth-step">
        {mode === "signin" && (
          <form onSubmit={onSignIn} className="space-y-4">
            <Head title="Welcome back" text="Sign in to manage your licenses, downloads and trading tools." />
            {emailField("em")}
            <Labeled id="pw" label="Password" icon={ICON.lock} right={<button type="button" className={linkBtn} onClick={() => go("forgot")}>Forgot password?</button>}>
              <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="current-password" />
            </Labeled>
            <Go>{busy ? "Signing in" : "Sign in"}</Go>
            <Alert />
            <GoogleBlock />
            <p className="pt-2 text-center text-sm text-muted">New here? <button type="button" className={linkBtn} onClick={() => go("signup")}>Create an account</button></p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={onSignUp} className="space-y-4">
            <Head title="Create your account" text="Use the same email you bought with, so your licenses appear automatically." />
            {emailField("em2")}
            <div>
              <Labeled id="pw2" label="Create a password" icon={ICON.lock}><PasswordInput id="pw2" value={password} onChange={setPassword} autoComplete="new-password" /></Labeled>
              <Strength value={password} />
            </div>
            <Go>{busy ? "Creating account" : "Create account"}</Go>
            <Alert />
            <GoogleBlock />
            <p className="pt-2 text-center text-sm text-muted">Already have an account? <button type="button" className={linkBtn} onClick={() => go("signin")}>Sign in</button></p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={onForgot} className="space-y-4">
            <Back to="signin" label="Back to sign in" />
            <Head title="Reset your password" text="Enter your email. We send a one-time code to confirm it is you." />
            {emailField("em3")}
            <Go>{busy ? "Sending code" : "Send code"}</Go>
            <Alert />
          </form>
        )}

        {mode === "verify" && (
          <form onSubmit={(e) => { e.preventDefault(); if (code.length >= 6) verify(code); }} className="space-y-5">
            <Back to={kind === "signup" ? "signup" : "forgot"} label="Use a different email" />
            <Head title={kind === "signup" ? "Check your email" : "Enter your reset code"} text={`Type the 6-digit code we sent to ${email.trim()}. Check spam if you do not see it.${kind === "signup" ? " Already bought before? You may already have an account: go back to Sign in and choose Forgot password." : ""}`} />
            <CodeInput value={code} onChange={setCode} onComplete={verify} disabled={busy} />
            <Go>{busy ? "Checking" : kind === "signup" ? "Verify and continue" : "Verify code"}</Go>
            <button type="button" onClick={resend} disabled={cooldown > 0 || busy} className="w-full text-sm font-semibold text-accent disabled:text-muted">{cooldown > 0 ? `Send a new code in ${cooldown}s` : "Send a new code"}</button>
            <Alert />
          </form>
        )}

        {mode === "newpw" && (
          <form onSubmit={onNewPw} className="space-y-4">
            <Head title="Choose a new password" text="Pick something long and unique that you do not use anywhere else." />
            <div>
              <Labeled id="npw" label="New password" icon={ICON.lock}><PasswordInput id="npw" value={password} onChange={setPassword} autoComplete="new-password" /></Labeled>
              <Strength value={password} />
            </div>
            <Go>{busy ? "Saving" : "Save password and sign in"}</Go>
            <p className="text-xs text-muted">Saving a new password also signs you out on your other devices.</p>
            <Alert />
          </form>
        )}

        {mode === "done" && (
          <div className="py-10 text-center" role="status">
            <span className="auth-check-ring mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/40 bg-forest/50 text-accent">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path className="auth-check-path" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            <h2 className="mt-5 font-display text-2xl font-bold">{doneText}</h2>
            <p className="mt-1.5 text-sm text-muted">Taking you to your dashboard…</p>
          </div>
        )}
      </div>

      {mode !== "done" && (
        <p className="mt-7 flex items-center justify-center gap-2 border-t border-line pt-5 text-xs text-muted"><span className="text-accent"><Svg d={ICON.shield} size={16} /></span>Encrypted connection. One-time codes. Automatic lockout.</p>
      )}
    </div>
  );
}
