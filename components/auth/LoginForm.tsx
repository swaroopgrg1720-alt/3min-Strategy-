"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

type Mode = "login" | "signup" | "forgot";

export function LoginForm({ next = "/dashboard" }: { next?: string }) {
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    try {
      const supabase = supabaseBrowser();

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign(next);
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign(next);
        } else {
          setMessage("Your account request was submitted. Check your email to confirm your account before signing in. If email delivery is rate-limited, wait before requesting another email.");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
        });
        if (error) throw error;
        setMessage("If the email can receive password-reset messages, a reset link will arrive shortly. Check your inbox and spam folder.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-5 flex gap-2">
        <button type="button" onClick={() => { setMode("login"); setMessage(""); setError(""); }}
          className={`rounded-lg px-3 py-2 text-sm ${mode === "login" ? "bg-accent text-bg" : "border border-line"}`}>
          Sign in
        </button>
        <button type="button" onClick={() => { setMode("signup"); setMessage(""); setError(""); }}
          className={`rounded-lg px-3 py-2 text-sm ${mode === "signup" ? "bg-accent text-bg" : "border border-line"}`}>
          Create account
        </button>
        <button type="button" onClick={() => { setMode("forgot"); setMessage(""); setError(""); }}
          className={`rounded-lg px-3 py-2 text-sm ${mode === "forgot" ? "bg-accent text-bg" : "border border-line"}`}>
          Forgot password
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email"
            className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60" />
        </label>

        {mode !== "forgot" && (
          <label className="block text-sm font-medium">
            Password
            <input name="password" type="password" required minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60" />
            {mode === "signup" && <span className="mt-1 block text-xs text-muted">Use at least 8 characters.</span>}
          </label>
        )}

        <button className="btn btn-primary w-full disabled:opacity-60" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send password reset email"}
        </button>
      </form>

      {message && <p role="status" className="mt-4 rounded-xl border border-accent/30 bg-forest/30 p-4 text-sm text-accent">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <p className="mt-4 text-xs text-muted">Use the same email address associated with your purchase or licence.</p>
    </div>
  );
}
