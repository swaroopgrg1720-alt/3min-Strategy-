import type { Metadata } from "next";
import { isAdminEmail, requireUser } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell email={user.email!} isAdmin={isAdminEmail(user.email)}>{children}</DashboardShell>;
}
