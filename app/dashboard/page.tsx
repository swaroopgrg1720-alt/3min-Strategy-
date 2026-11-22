import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { currentProduct, myLicenses } from "@/lib/db/customer";
import { LicenseTable, type LicenseView } from "@/components/dashboard/LicenseTable";
import { Ico, PageHeader, daysLeft, dmy, type IconName } from "@/components/dashboard/ui";
import { OpenChatButton } from "@/components/dashboard/OpenChatButton";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireUser();
  const [all, product] = await Promise.all([myLicenses(), currentProduct()]);
  const views: LicenseView[] = all.map((l) => ({
    id: l.id, license_ref: l.license_ref, plan: l.plan, start_date: l.start_date,
    expiration_date: l.expiration_date, mt5_account: l.mt5_account, state: l.state,
  }));
  const active = all.filter((l) => l.state === "active");
  const monthlyActive = active.filter((l) => l.plan === "monthly" && l.expiration_date);
  const next = monthlyActive.map((l) => l.expiration_date as string).sort()[0];
  const nextDays = daysLeft(next);
  const hasLifetime = active.some((l) => l.plan === "lifetime");
  const account = all.find((l) => l.mt5_account)?.mt5_account ?? null;
  const name = (user.email ?? "").split("@")[0] || "there";

  const expiredMonthly = all.filter((l) => l.plan === "monthly" && l.state === "expired");
  const soon = nextDays !== null && nextDays <= 7;
  const alert = expiredMonthly.length > 0 && active.length === 0
    ? { tone: "red", text: "Your license has expired. Renew to keep the EA working." }
    : soon ? { tone: "amber", text: `Your license expires in ${Math.max(nextDays as number, 0)} day${nextDays === 1 ? "" : "s"}. Renew now so trading is not interrupted.` } : null;

  const stats: { icon: IconName; label: string; value: string; note?: string }[] = [
    { icon: "key", label: "Active licenses", value: String(active.length), note: all.length > active.length ? `${all.length} in total` : undefined },
    { icon: "clock", label: "Next expiry", value: hasLifetime && !next ? "Lifetime" : dmy(next ?? null), note: nextDays !== null && nextDays > 0 ? `${nextDays} days left` : undefined },
    { icon: "chip", label: "MT5 account", value: account ?? "Not set", note: account ? "Key locked to this account" : "Set when you generate your key" },
    { icon: "box", label: "Current EA version", value: product?.version ? `v${product.version.replace(/^v/i, "")}` : "—", note: product?.created_at ? `Released ${dmy(product.created_at)}` : undefined },
  ];

  const steps = [
    { done: all.length > 0, title: "Get a license", text: "Your payment is confirmed and the license is on your account.", href: "/dashboard/renew", cta: "Buy" },
    { done: !!account, title: "Generate your key", text: "Enter your MT5 account number and copy the license key.", href: "/dashboard/license", cta: "Open" },
    { done: false, title: "Download and install", text: "Put the EA in MetaTrader 5 and follow the guide.", href: "/dashboard/downloads", cta: "Download" },
  ];
  const nextIdx = steps.findIndex((s) => !s.done);

  const quick: { href: string; icon: IconName; t: string; d: string }[] = [
    { href: "/dashboard/renew", icon: "renew", t: "Renew or buy", d: "Add months in a few taps" },
    { href: "/dashboard/journal", icon: "journal", t: "Trading journal", d: "Log and review trades" },
    { href: "/dashboard/tools", icon: "tools", t: "Trading tools", d: "Risk and lot calculators" },
  ];

  return (
    <>
      <PageHeader title={`Welcome back, ${name}`} text="Your licenses, downloads and trading tools in one place.">
        {active.length > 0 && <Link href="/dashboard/downloads" className="inline-flex min-h-[46px] items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-bg active:brightness-95"><Ico name="download" size={18} />Download EA</Link>}
        <Link href="/dashboard/documentation" className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold text-ink active:bg-forest/40"><Ico name="book" size={18} />Installation guide</Link>
      </PageHeader>

      {alert && (
        <div role="status" className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${alert.tone === "red" ? "border-red-400/30 bg-red-400/10" : "border-amber-300/30 bg-amber-300/10"}`}>
          <p className={`flex items-center gap-2.5 text-sm font-medium ${alert.tone === "red" ? "text-red-200" : "text-amber-200"}`}><Ico name="alert" size={20} />{alert.text}</p>
          <Link href="/dashboard/renew" className="inline-flex min-h-[42px] items-center rounded-full bg-accent px-5 text-sm font-semibold text-bg active:brightness-95">Renew now</Link>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-bg p-4">
            <div className="flex items-center gap-2 text-muted"><span className="text-accent"><Ico name={s.icon} size={18} /></span><dt className="text-[13px]">{s.label}</dt></div>
            <dd className="mt-2 truncate font-display text-xl font-semibold sm:text-2xl">{s.value}</dd>
            {s.note && <p className="mt-0.5 truncate text-xs text-muted">{s.note}</p>}
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Licenses" className="min-w-0">
          <h2 className="mb-3 font-display text-lg font-semibold">Your licenses</h2>
          <LicenseTable licenses={views} />
          {all.length === 0 && (
            <p className="mt-4 text-sm text-muted">Signed in with a different email than your purchase? Use the same email you ordered with, or <Link className="text-accent underline" href="/contact">contact support</Link>.</p>
          )}
        </section>

        <aside className="space-y-4">
          <section aria-label="Getting started" className="rounded-2xl border border-line bg-bg p-4">
            <h2 className="font-display text-lg font-semibold">Getting started</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${s.done ? "bg-accent text-bg" : i === nextIdx ? "border border-accent text-accent" : "border border-line text-muted"}`}>
                    {s.done ? <Ico name="check" size={15} /> : i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted">{s.text}</p>
                    {!s.done && i === nextIdx && <Link href={s.href} className="mt-1.5 inline-block text-sm font-semibold text-accent">{s.cta} ›</Link>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <nav aria-label="Quick actions" className="overflow-hidden rounded-2xl border border-line bg-bg">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className="flex items-center gap-3 border-b border-line px-4 py-3.5 active:bg-forest/30">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/50 text-accent"><Ico name={q.icon} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{q.t}</span><span className="block text-xs text-muted">{q.d}</span></span>
                <span className="text-muted"><Ico name="arrow" size={18} /></span>
              </Link>
            ))}
            <OpenChatButton className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-forest/30">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/50 text-accent"><Ico name="help" /></span>
              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Chat with support</span><span className="block text-xs text-muted">Ask our team a question</span></span>
              <span className="text-muted"><Ico name="arrow" size={18} /></span>
            </OpenChatButton>
          </nav>
        </aside>
      </div>
    </>
  );
}
