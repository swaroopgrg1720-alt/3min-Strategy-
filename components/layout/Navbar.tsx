"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/config/site";
import { Logo } from "@/components/ui/Logo";
import { IconClose, IconMenu } from "@/components/ui/Icons";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-bg">
        Skip to content
      </a>
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="3MIN SCALP — home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {site.nav.map((n) => {
            const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition ${active ? "text-accent" : "text-muted hover:text-ink"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost hidden !py-2 sm:inline-flex">
            Login
          </Link>
          <Link href="/pricing" className="btn btn-primary hidden !py-2 sm:inline-flex">
            Get 3MIN SCALP
          </Link>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

    </header>
      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 bg-bg lg:hidden">
          <nav aria-label="Mobile" className="container-x flex h-full flex-col gap-1 overflow-y-auto py-6">
            {site.nav.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-2xl px-4 py-4 font-display text-xl font-semibold text-ink active:bg-forest/40 hover:bg-forest/30">
                {n.label}
              </Link>
            ))}
            <Link href="/login" className="btn btn-ghost mt-4 !py-4 text-base">
              Login
            </Link>
            <Link href="/pricing" className="btn btn-primary !py-4 text-base">
              Get 3MIN SCALP
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
