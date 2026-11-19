import { AdminShell } from "@/components/admin/AdminShell";
import { getUser } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => null); // never crash the sign-in page if Supabase is not configured
  return <AdminShell email={user?.email ?? undefined}>{children}</AdminShell>;
}
