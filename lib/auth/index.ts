import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  // An account whose email was never confirmed by code must not see anyone's licenses.
  return data.user?.email_confirmed_at ? data.user : null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user?.email) redirect("/login");
  return user;
}

export const isAdminEmail = (email?: string | null) =>
  !!email &&
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());

/** Server-side admin gate. Call at the top of every admin page AND every admin action. */
export async function requireAdmin() {
  const user = await getUser();
  if (!user?.email || !isAdminEmail(user.email)) redirect("/admin/login");
  return user;
}
