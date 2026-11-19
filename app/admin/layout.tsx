import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="3MIN SCALP home"><Logo /></Link>
          <span className="rounded-lg border border-accent/40 bg-forest/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">Admin</span>
        </div>
      </header>
      {children}
    </div>
  );
}
