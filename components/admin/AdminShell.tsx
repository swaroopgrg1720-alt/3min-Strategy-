"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";

const ICONS: Record<string, string[]> = {
  home: ["M4 4h7v7H4z", "M13 4h7v4h-7z", "M13 10h7v10h-7z", "M4 13h7v7H4z"],
  orders: ["M6 3h12l1 4H5z", "M5 7v13h14V7", "M9 11h6"],
  licenses: ["M15 7a4 4 0 1 1-3.9 4.9L4 19v-3h3v-2h2l2.1-2.1A4 4 0 0 1 15 7z"],
  customers: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M16 4.5a3.5 3.5 0 0 1 0 6.5", "M18 14a6 6 0 0 1 3.5 6"],
  download: ["M12 4v11", "m7 11 5 5 5-5", "M5 20h14"],
  support: ["M4 13v-1a8 8 0 0 1 16 0v1", "M4 13h3v5H5a1 1 0 0 1-1-1z", "M20 13h-3v5h2a1 1 0 0 0 1-1z", "M17 18c0 2-2 3-5 3"],
  chat: ["M4 5h16v11H9l-5 4z"],
  site: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M3 12h18", "M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"],
  logout: ["M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4", "M16 8l4 4-4 4", "M20 12H9"],
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(ICONS[name] ?? []).map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/licenses", label: "Licenses", icon: "licenses" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/downloads", label: "EA downloads", icon: "download" },
  { href: "/admin/chat", label: "Live chat", icon: "chat" },
  { href: "/admin/support", label: "Support", icon: "support" },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email?: string }) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (path.startsWith("/admin/login")) return;
    let live = true;
    const check = () => { if (document.hidden) return; fetch("/api/admin/chat/unread", { cache: "no-store" }).then((r) => r.json()).then((j) => live && setChatUnread(j.count ?? 0)).catch(() => {}); };
    check();
    const id = window.setInterval(check, 15_000);
    return () => { live = false; window.clearInterval(id); };
  }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // The sign-in page has no menu.
  if (path === "/admin/login" || path.startsWith("/admin/login/")) {
    return (
      <div className="min-h-screen bg-bg">
        <header className="border-b border-line bg-bg">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" aria-label="3MIN SCALP home"><Logo /></Link>
            <span className="rounded-full border border-accent/40 bg-forest/40 px-3 py-1.5 text-sm font-semibold text-accent">Admin</span>
          </div>
        </header>
        {children}
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? path === href : path === href || path.startsWith(`${href}/`));
  const initial = (email ?? "A").charAt(0).toUpperCase();

  const menu = (
    <nav aria-label="Admin menu" className="flex h-full flex-col">
      <ul className="flex-1 space-y-1.5 overflow-y-auto p-3">
        {ADMIN_NAV.map((n) => {
          const on = isActive(n.href);
          return (
            <li key={n.href}>
              <Link href={n.href} aria-current={on ? "page" : undefined}
                className={`relative flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 text-[15px] font-medium active:bg-forest/50 ${on ? "border-accent bg-forest/40 text-accent" : "border-transparent text-ink"}`}>
                {on && <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-accent" aria-hidden="true" />}
                <Icon name={n.icon} />{n.label}
                {n.icon === "chat" && chatUnread > 0 && <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-bg">{chatUnread}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1.5 border-t border-line p-3">
        <Link href="/" className="flex min-h-[48px] items-center gap-3 rounded-2xl px-4 text-[15px] text-muted active:bg-forest/50"><Icon name="site" />View website</Link>
        <form action="/auth/signout" method="post">
          <button className="flex min-h-[48px] w-full items-center gap-3 rounded-2xl bg-red-400/10 px-4 text-[15px] font-medium text-red-300 active:bg-red-400/20"><Icon name="logout" />Sign out</button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open menu" aria-expanded={open} aria-controls="admin-drawer" onClick={() => setOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/50 text-accent active:bg-forest/40 lg:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" /></svg>
            </button>
            <Link href="/admin" aria-label="Admin overview"><Logo /></Link>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-bg2 py-1 pl-1 pr-3" title={email}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-bg" aria-hidden="true">{initial}</span>
            <span className="text-sm font-semibold text-accent">Admin</span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div id="admin-drawer" role="dialog" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-[300px] max-w-[85vw] flex-col border-r border-line bg-bg2">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="min-w-0"><p className="font-display text-lg font-semibold">Admin</p><p className="truncate text-xs text-muted">{email}</p></div>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-ink active:bg-forest/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
            <div className="min-h-0 flex-1">{menu}</div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-5 sm:px-6 sm:py-6">
        <aside className="sticky top-24 hidden h-[calc(100vh-8rem)] w-64 shrink-0 overflow-hidden rounded-3xl border border-line bg-bg2 lg:block">{menu}</aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
