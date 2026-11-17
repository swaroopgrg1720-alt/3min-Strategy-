"use client";
import { usePathname } from "next/navigation";

/** Pages that behave like an app (own header/sidebar) do not show the marketing menu and footer. */
const APP_PREFIXES = ["/dashboard", "/login", "/admin"];

export function SiteChrome({ header, footer, children }: { header: React.ReactNode; footer: React.ReactNode; children: React.ReactNode }) {
  const path = usePathname() ?? "/";
  const isApp = APP_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
  return (
    <>
      {!isApp && header}
      <main id="main">{children}</main>
      {!isApp && footer}
    </>
  );
}
