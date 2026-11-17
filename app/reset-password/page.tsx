"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");

    try {
      if (password.length < 8) throw new Error("Use a password with at least 8 characters.");
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) throw error;
      setMessage("Your password has been updated. You can now sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password. Request a new reset link.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="container-x max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <p className="mt-2 text-sm text-muted">Enter a new password for your customer account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              New password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                minLength={8} required autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60" />
            </label>
            <button className="btn btn-primary w-full disabled:opacity-60" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
          {message && <p role="status" className="mt-4 text-sm text-accent">{message} <a className="underline" href="/login">Go to login</a>.</p>}
          {error && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </div>
    </section>
  );
}
