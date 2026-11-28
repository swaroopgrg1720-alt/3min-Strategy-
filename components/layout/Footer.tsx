import Link from "next/link";
import { site } from "@/lib/config/site";
import { Logo } from "@/components/ui/Logo";
import { SocialIcon } from "@/components/ui/Icons";

const legal = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/risk-disclosure", label: "Risk Disclosure" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg2/60">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              A MetaTrader 5 Expert Advisor for automated trading across EURUSD, GBPUSD and XAUUSD.
            </p>
            <ul className="mt-5 flex gap-3" aria-label="Social links">
              {site.social.map((s) => (
                <li key={s.id}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted transition hover:border-accent/50 hover:text-accent">
                      <SocialIcon id={s.id} />
                    </a>
                  ) : (
                    <span title={s.placeholder} aria-label={`${s.label} ${s.placeholder}`} className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-muted/60">
                      <SocialIcon id={s.id} />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="Site">
            <p className="eyebrow">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {site.nav.slice(1).map((n) => (
                <li key={n.href}><Link className="hover:text-ink" href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link className="hover:text-ink" href="/indicator">TradingView Indicator</Link></li>
              <li><Link className="hover:text-ink" href="/contact">Contact</Link></li>
              <li><Link className="hover:text-ink" href="/changelog">Changelog</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="eyebrow">Legal</p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {legal.map((n) => (
                <li key={n.href}><Link className="hover:text-ink" href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          Risk warning: Forex and CFD trading involves substantial risk and may not be suitable for everyone. Automated trading does not
          eliminate market risk, and past performance does not guarantee future results. 3MIN SCALP does not guarantee profits or
          protection from losses. Only trade with money you can afford to lose. Payments are accepted in cryptocurrency only.
        </p>
        <p className="mt-3 text-xs text-muted">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
