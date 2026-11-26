"use server";
import { redirect } from "next/navigation";
import { clear, hit, tooMany } from "@/lib/auth/throttle";
import { passwordProblem } from "@/lib/auth/password";
import { getUser } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase/server";

export type Result = { ok: boolean; message: string };

/** Changes the password after checking the current one. Other devices are signed out. */
export async function changePassword(current: string, next: string): Promise<Result> {
  const user = await getUser();
  if (!user?.email) return { ok: false, message: "Please sign in again." };
  const key = `cp:${user.id}`;
  if (await tooMany(key, 5, 900)) return { ok: false, message: "Too many attempts. Please wait 15 minutes." };
  const problem = passwordProblem(next, user.email);
  if (problem) return { ok: false, message: problem };
  if (next === current) return { ok: false, message: "Choose a password you have not used before." };

  const sb = await supabaseServer();
  const check = await sb.auth.signInWithPassword({ email: user.email, password: current });
  if (check.error) { await hit(key); return { ok: false, message: "Your current password is incorrect." }; }
  const { error } = await sb.auth.updateUser({ password: next });
  if (error) return { ok: false, message: "Could not save the new password. Please try again." };
  await clear(key);
  await sb.auth.signOut({ scope: "others" });
  return { ok: true, message: "Password changed. Your other devices were signed out." };
}

export async function signOutEverywhere() {
  const sb = await supabaseServer();
  await sb.auth.signOut({ scope: "global" });
  redirect("/login");
}
