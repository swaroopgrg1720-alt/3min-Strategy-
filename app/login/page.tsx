import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Customer Login", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const configured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return (
    <section className="section">
      <div className="container-x max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold">Customer login</h1>
          <p className="mt-2 text-sm text-muted">Sign in to access your license and downloads.</p>
          {error && <p role="alert" className="mt-4 text-sm text-red-400">That sign-in link is invalid or expired. Please try again.</p>}
          {configured ? (
            <LoginForm next={safeNext} />
          ) : (
            <p role="status" className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
              Sign-in is not configured yet. Set the Supabase environment variables (see SETUP.md).
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
