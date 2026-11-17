import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLoginForms } from "@/components/auth/AdminLoginForms";
import { getUser, isAdminEmail } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const need = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_EMAILS"];
  const missing = need.filter((k) => !process.env[k]?.trim());
  const configured = missing.length === 0;
  if (configured) {
    const user = await getUser();
    if (user && isAdminEmail(user.email)) redirect("/admin");
  }
  return (
    <section className="section">
      <div className="container-x max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold">Admin login</h1>
          <p className="mt-2 text-sm text-muted">Owner access to licenses, orders and downloads.</p>
          {configured ? <AdminLoginForms /> : (
            <p role="status" className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
              Not configured. Missing in Vercel: {missing.join(", ")}. Add them under Settings → Environment Variables, then redeploy.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
