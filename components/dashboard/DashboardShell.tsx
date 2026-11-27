"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

const ICONS: Record<string, string[]> = {
  dashboard: ["M4 4h7v7H4z", "M13 4h7v4h-7z", "M13 10h7v10h-7z", "M4 13h7v7H4z"],
  license: ["M15 7a4 4 0 1 1-3.9 4.9L4 19v-3h3v-2h2l2.1-2.1A4 4 0 0 1 15 7z", "M16.5 8.5h.01"],
  indicator: ["M3 17l5-6 4 3 5-8 4 5", "M3 21h18"],
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
  { href: "/dashboard/indicator", label: "Indicator", icon: "indicator" },
  { href: "/dashboard/journal", label: "Trading Journal", icon: "journal" },
  { href: "/dashboard/tools", label: "Trading Tools", icon: "tools" },
  { href: "/dashboard/documentation", label: "Documentation", icon: "docs" },
  { href: "/dashboard/support", label: "Support", icon: "support" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

const GROUPS: { title: string; items: { href: string; label: string; icon: string }[] }[] = [
  { title: "Overview", items: dashNav.slice(0, 3) },
  { title: "Tools", items: dashNav.slice(3, 8) },
  { title: "Help", items: dashNav.slice(8) },
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
  const isActive = (href: string) => (href === "/dashboard" ? path === href : path === href || path.startsWith(`${href}/`));

  const link = (n: { href: string; label: string; icon: string }) => {
    const active = isActive(n.href);
    return (
      <li key={n.href}>
        <Link href={n.href} aria-current={active ? "page" : undefined}
          className={`relative flex min-h-[46px] items-center gap-3 rounded-xl px-4 text-[15px] font-medium active:bg-forest/50 lg:hover:bg-forest/30 ${active ? "bg-forest/50 text-accent" : "text-ink"}`}>
          {active && <span className="absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r bg-accent" aria-hidden="true" />}
          <Icon name={n.icon} />{n.label}
        </Link>
      </li>
    );
  };

  const menu = (
    <nav aria-label="Dashboard menu" className="flex h-full flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-3">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="px-4 pb-1.5 text-xs font-semibold text-muted">{g.title}</p>
            <ul className="space-y-1">{g.items.map(link)}</ul>
          </div>
        ))}
        {isAdmin && (
          <div>
            <p className="px-4 pb-1.5 text-xs font-semibold text-muted">Owner</p>
            <ul>{link({ href: "/admin", label: "Admin Panel", icon: "admin" })}</ul>
          </div>
        )}
      </div>
      <div className="border-t border-line p-3">
        <div className="mb-2 flex items-center gap-3 px-2 py-1" title={email}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-bg" aria-hidden="true">{initial}</span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{name}</p><p className="truncate text-xs text-muted">{email}</p></div>
        </div>
        <form action="/auth/signout" method="post">
          <button className="flex min-h-[46px] w-full items-center gap-3 rounded-xl px-4 text-[15px] font-medium text-muted active:bg-forest/50 lg:hover:bg-forest/30 lg:hover:text-ink"><Icon name="logout" />Logout</button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open menu" aria-expanded={open} aria-controls="app-menu" onClick={() => setOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent active:bg-forest/40 lg:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 8h14M5 12h9M5 16h14" /></svg>
            </button>
            <Link href="/dashboard" aria-label="3MIN SCALP dashboard"><Logo /></Link>
          </div>
          <div className="flex items-center gap-2.5 rounded-full border border-line bg-bg2 py-1 pl-1 pr-4" title={email}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-bg" aria-hidden="true">{initial}</span>
            <span className="hidden max-w-[160px] truncate text-sm font-medium sm:block">{name}</span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div id="app-menu" role="dialog" aria-label="Dashboard menu" className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col border-r border-line bg-bg2">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-forest/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="min-h-0 flex-1">{menu}</div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-5 sm:px-6 sm:py-6">
        <aside aria-label="Dashboard menu" className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 shrink-0 overflow-hidden rounded-3xl border border-line bg-bg2 lg:block">{menu}</aside>
        <div className="min-w-0 flex-1">
          <div className="rounded-3xl border border-line bg-bg2/60 p-4 sm:p-8">{children}</div>
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
