"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

const ICONS: Record<string, string[]> = {
  dashboard: ["M4 4h7v7H4z", "M13 4h7v4h-7z", "M13 10h7v10h-7z", "M4 13h7v7H4z"],
  license: ["M15 7a4 4 0 1 1-3.9 4.9L4 19v-3h3v-2h2l2.1-2.1A4 4 0 0 1 15 7z", "M16.5 8.5h.01"],
  renew: ["M20 12a8 8 0 1 1-2.4-5.7", "M20 4v5h-5"],
  download: ["M12 4v11", "m7 11 5 5 5-5", "M5 20h14"],
  journal: ["M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z", "M6 3v18", "M10 8h6", "M10 12h6"],
  tools: ["M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z", "M8 7h8", "M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"],
  docs: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 13h6", "M10 17h6"],
  support: ["M4 13v-1a8 8 0 0 1 16 0v1", "M4 13h3v5H5a1 1 0 0 1-1-1z", "M20 13h-3v5h2a1 1 0 0 0 1-1z", "M17 18c0 2-2 3-5 3"],
  account: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"],
  admin: ["M12 3 4 6v6c0 4.5 3.2 7.7 8 9 4.8-1.3 8-4.5 8-9V6z", "m9 12 2 2 4-4"],
  logout: ["M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4", "M16 8l4 4-4 4", "M20 12H9"],
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(ICONS[name] ?? []).map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export const dashNav = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/license", label: "My License", icon: "license" },
  { href: "/dashboard/renew", label: "Renew / Buy", icon: "renew" },
  { href: "/dashboard/downloads", label: "Download", icon: "download" },
  { href: "/dashboard/journal", label: "Trading Journal", icon: "journal" },
  { href: "/dashboard/tools", label: "Trading Tools", icon: "tools" },
  { href: "/dashboard/documentation", label: "Documentation", icon: "docs" },
  { href: "/dashboard/support", label: "Support", icon: "support" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

export function DashboardShell({ children, email, isAdmin = false }: { children: React.ReactNode; email?: string; isAdmin?: boolean }) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const name = email ? email.split("@")[0] : "Account";
  const initial = name.charAt(0).toUpperCase() || "A";
  const items = isAdmin ? [...dashNav, { href: "/admin", label: "Admin Panel", icon: "admin" }] : dashNav;
  const isActive = (href: string) => (href === "/dashboard" ? path === href : path === href || path.startsWith(`${href}/`));

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Toggle menu" aria-expanded={open} aria-controls="app-menu" onClick={() => setOpen((v) => !v)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/50 text-accent transition hover:bg-forest/40 lg:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 8h14M5 12h9M5 16h14" /></svg>
            </button>
            <Link href="/dashboard" aria-label="3MIN SCALP dashboard"><Logo /></Link>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-bg2 py-1.5 pl-1.5 pr-4" title={email}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-sm font-bold text-bg" aria-hidden="true">{initial}</span>
            <span className="hidden max-w-[160px] truncate text-sm font-medium sm:block">{name}</span>
          </div>
        </div>
      </header>

      {open && <button aria-label="Close menu" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6 sm:px-6">
        <aside id="app-menu" aria-label="Dashboard menu"
          className={`${open ? "block" : "hidden"} fixed left-4 top-[76px] z-50 w-[270px] rounded-2xl border border-line bg-bg2 p-3 shadow-2xl lg:sticky lg:top-24 lg:z-auto lg:block lg:h-fit lg:w-64 lg:shrink-0 lg:shadow-none`}>
          <nav>
            <ul className="space-y-1">
              {items.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link href={n.href} aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-accent font-semibold text-bg" : "text-ink hover:bg-forest/40"}`}>
                      <Icon name={n.icon} />{n.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-1">
                <form action="/auth/signout" method="post">
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted transition hover:bg-forest/40 hover:text-ink">
                    <Icon name="logout" />Logout
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="rounded-3xl border border-line bg-bg2/60 p-5 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
    </div>
  );
}
