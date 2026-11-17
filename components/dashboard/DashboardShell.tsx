"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const dashNav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/license", label: "My License" },
  { href: "/dashboard/downloads", label: "Download" },
  { href: "/dashboard/journal", label: "Trading Journal" },
  { href: "/dashboard/tools", label: "Trading Tools" },
  { href: "/dashboard/documentation", label: "Documentation" },
  { href: "/dashboard/support", label: "Support" },
  { href: "/dashboard/account", label: "Account" },
];

export function DashboardShell({ children, email }: { children: React.ReactNode; email?: string }) {
  const path = usePathname();
  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[220px_1fr]">
      <nav aria-label="Dashboard" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {dashNav.map((n) => {
          const active = path === n.href;
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-medium transition ${active ? "border-accent/50 bg-forest/40 text-accent" : "border-line text-muted hover:text-ink"}`}>
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div>
        {email && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <span>Signed in as {email}</span>
            <form action="/auth/signout" method="post"><button className="btn btn-ghost !py-1.5 !text-xs">Sign out</button></form>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="card text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
    </div>
  );
}
