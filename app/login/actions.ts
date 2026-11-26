"use server";
import { clear, clientIp, hit, tooMany } from "@/lib/auth/throttle";
import { passwordProblem } from "@/lib/auth/password";
import { isValidEmail, sanitizeText } from "@/lib/security";
import { supabaseServer } from "@/lib/supabase/server";

export type R = { ok: true; next?: string } | { ok: false; error: string; needsVerify?: boolean };

const GENERIC = "Incorrect email or password.";
const LOCKED = "Too many attempts. Please wait 15 minutes and try again.";
const BAD_CODE = "That code is incorrect or has expired.";
const norm = (e: string) => sanitizeText(e, 254).toLowerCase();
const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard");

export async function signIn(emailRaw: string, password: string, next?: string): Promise<R> {
  const email = norm(emailRaw), ip = await clientIp();
  if (!isValidEmail(email) || !password || password.length > 128) return { ok: false, error: GENERIC };
  if ((await tooMany(`si:ip:${ip}`, 40, 900)) || (await tooMany(`si:em:${email}`, 6, 900))) return { ok: false, error: LOCKED };

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await Promise.all([hit(`si:ip:${ip}`), hit(`si:em:${email}`)]);
    if (/not confirmed/i.test(error?.message ?? "")) return { ok: false, error: "Your email is not confirmed yet. Enter the code we email you.", needsVerify: true };
    return { ok: false, error: GENERIC };
  }
  if (!data.user.email_confirmed_at) { await sb.auth.signOut(); return { ok: false, error: "Your email is not confirmed yet. Enter the code we email you.", needsVerify: true }; }
  await clear(`si:em:${email}`);
  return { ok: true, next: safeNext(next) };
}

export async function signUp(emailRaw: string, password: string): Promise<R> {
  const email = norm(emailRaw), ip = await clientIp();
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  const problem = passwordProblem(password, email);
  if (problem) return { ok: false, error: problem };
  if (await tooMany(`su:ip:${ip}`, 8, 3600)) return { ok: false, error: "Too many sign-up attempts. Please try again later." };
  await hit(`su:ip:${ip}`);

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { ok: false, error: /rate|too many/i.test(error.message) ? "Too many emails sent. Please wait a few minutes." : "Could not create the account. Please try again." };
  if (data.session) { // email confirmation is switched off in Supabase: refuse, an unverified email must never get in
    await sb.auth.signOut();
    return { ok: false, error: "Sign-up is not available right now. Please contact support." };
  }
  return { ok: true };
}

/** Emails a fresh code. Always answers the same, so nobody can find out which emails have accounts. */
export async function sendCode(emailRaw: string, kind: "signup" | "recovery"): Promise<R> {
  const email = norm(emailRaw), ip = await clientIp();
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." };
  if ((await tooMany(`sc:em:${email}`, 4, 3600)) || (await tooMany(`sc:ip:${ip}`, 12, 3600))) return { ok: false, error: "Too many codes requested. Please wait before trying again." };
  await Promise.all([hit(`sc:em:${email}`), hit(`sc:ip:${ip}`)]);
  const sb = await supabaseServer();
  if (kind === "signup") await sb.auth.resend({ type: "signup", email });
  else await sb.auth.resetPasswordForEmail(email);
  return { ok: true };
}

/** Checks the emailed code. For "signup" this signs the person in; for "recovery" it allows setting a new password. */
export async function verifyCode(emailRaw: string, code: string, kind: "signup" | "recovery", next?: string): Promise<R> {
  const email = norm(emailRaw);
  const token = code.replace(/\s/g, "");
  if (!isValidEmail(email) || !/^\d{6,10}$/.test(token)) return { ok: false, error: BAD_CODE };
  if (await tooMany(`vc:em:${email}`, 6, 900)) return { ok: false, error: LOCKED };
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.verifyOtp({ email, token, type: kind });
  if (error || !data.user) { await hit(`vc:em:${email}`); return { ok: false, error: BAD_CODE }; }
  await clear(`vc:em:${email}`);
  return { ok: true, next: safeNext(next) };
}

/** Sets the new password after a successful recovery code. Other devices are signed out. */
export async function setNewPassword(password: string, next?: string): Promise<R> {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  if (!data.user?.email) return { ok: false, error: "Your code session expired. Start again with Forgot password." };
  const problem = passwordProblem(password, data.user.email);
  if (problem) return { ok: false, error: problem };
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { ok: false, error: /different|same/i.test(error.message) ? "Choose a password you have not used before." : "Could not save the password. Please try again." };
  await sb.auth.signOut({ scope: "others" });
  return { ok: true, next: safeNext(next) };
}
