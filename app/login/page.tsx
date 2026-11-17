import type { Metadata } from "next";

export const metadata: Metadata = { title: "Customer Login", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <section className="section">
      <div className="container-x max-w-md">
        <div className="card">
          <h1 className="text-2xl font-bold">Customer login</h1>
          <p className="mt-2 text-sm text-muted">Sign in to access your license and downloads.</p>
          <p role="status" className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-300">
            Preview: authentication is not connected yet. Configure AUTH_SECRET and DATABASE_URL and add an auth provider (see README).
          </p>
          <form className="mt-6 space-y-4" aria-disabled="true">
            <label className="block text-sm font-medium">Email
              <input type="email" disabled className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm opacity-60" />
            </label>
            <button type="button" disabled className="btn btn-primary w-full opacity-60">Sign in (not available yet)</button>
          </form>
        </div>
      </div>
    </section>
  );
}
