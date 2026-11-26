"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdminEmail } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { isValidEmail, rateLimit, sanitizeText } from "@/lib/security";
import { clear, hit, tooMany } from "@/lib/auth/throttle";
import { passwordProblem } from "@/lib/auth/password";

export interface FormState { error?: string }

async function ip() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Creates the admin account. Only emails listed in ADMIN_EMAILS can ever register here. */
export async function adminSignUp(_: FormState, f: FormData): Promise<FormState> {
  if (!rateLimit(`admin-signup:${await ip()}`, 5, 60_000)) return { error: "Too many attempts. Wait a minute." };
  const email = sanitizeText(f.get("email"), 254).toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!isValidEmail(email)) return { error: "Enter a valid email." };
  if (!isAdminEmail(email)) return { error: "This email is not allowed to create an admin account." };
  const problem = passwordProblem(password, email);
  if (problem) return { error: problem };

  const { error } = await supabaseAdmin().auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return { error: /already|registered|exists/i.test(error.message) ? "Account already exists. Use Sign in." : "Could not create the account." };

  const { error: signInError } = await (await supabaseServer()).auth.signInWithPassword({ email, password });
  if (signInError) return { error: "Account created. Please sign in." };
  await clear(`ad:em:${email}`);
  redirect("/admin");
}

export async function adminSignIn(_: FormState, f: FormData): Promise<FormState> {
  if (!rateLimit(`admin-signin:${await ip()}`, 8, 60_000)) return { error: "Too many attempts. Wait a minute." };
  const email = sanitizeText(f.get("email"), 254).toLowerCase();
  const password = String(f.get("password") ?? "");
  if (await tooMany(`ad:em:${email}`, 5, 900)) return { error: "Too many attempts. Please wait 15 minutes." };
  const { error } = await (await supabaseServer()).auth.signInWithPassword({ email, password });
  if (error || !isAdminEmail(email)) {
    await hit(`ad:em:${email}`);
    if (!error) await (await supabaseServer()).auth.signOut(); // signed in but not an admin
    return { error: "Incorrect email or password." };
  }
  await clear(`ad:em:${email}`);
  redirect("/admin");
}
