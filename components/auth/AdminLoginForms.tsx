"use client";
import { useActionState, useState } from "react";
import { adminSignIn, adminSignUp, type FormState } from "@/app/admin/login/actions";

const input = "mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm focus:border-accent/60";

export function AdminLoginForms() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState<FormState, FormData>(adminSignIn, {});
  const [signUpState, signUpAction, signUpPending] = useActionState<FormState, FormData>(adminSignUp, {});
  const signup = mode === "signup";
  const state = signup ? signUpState : signInState;
  const pending = signup ? signUpPending : signInPending;

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-2" role="tablist">
        <button type="button" role="tab" aria-selected={!signup} onClick={() => setMode("signin")} className={`btn !py-2 ${!signup ? "btn-primary" : "btn-ghost"}`}>Sign in</button>
        <button type="button" role="tab" aria-selected={signup} onClick={() => setMode("signup")} className={`btn !py-2 ${signup ? "btn-primary" : "btn-ghost"}`}>Create admin account</button>
      </div>
      <form action={signup ? signUpAction : signInAction} className="mt-5 space-y-4" key={mode}>
        <label className="block text-sm font-medium">Email
          <input name="email" type="email" required autoComplete="email" className={input} />
        </label>
        <label className="block text-sm font-medium">Password
          <input name="password" type="password" required minLength={signup ? 12 : 1} autoComplete={signup ? "new-password" : "current-password"} className={input} />
        </label>
        {signup && <p className="text-xs text-muted">At least 12 characters with upper and lower case, a number and a symbol. Only the email set in ADMIN_EMAILS can register.</p>}
        <button className="btn btn-primary w-full disabled:opacity-60" disabled={pending}>{pending ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
        {state.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      </form>
    </>
  );
}
