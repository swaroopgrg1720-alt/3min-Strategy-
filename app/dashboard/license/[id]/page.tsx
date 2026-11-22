import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarReminder } from "@/components/dashboard/CalendarReminder";
import { CopyButton } from "@/components/dashboard/CopyButton";
import { Countdown } from "@/components/dashboard/Countdown";
import { OpenChatButton } from "@/components/dashboard/OpenChatButton";
import { RevealKey } from "@/components/dashboard/RevealKey";
import { Ico, Ring, StatusPill, daysLeft, dmy, dt, type IconName } from "@/components/dashboard/ui";
import { LogoMark } from "@/components/ui/Logo";
import { licensePayments, myLicenseById } from "@/lib/db/customer";

export const dynamic = "force-dynamic";

const PAY: Record<string, string> = { confirmed: "Paid", refunded: "Refunded", payment_detected: "Confirming" };
const row = "flex min-h-[48px] items-center gap-3 rounded-xl border border-line bg-bg px-4 text-sm font-semibold active:bg-forest/40";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const l = await myLicenseById(id);
  if (!l) notFound();
  const payments = await licensePayments(l.id);
  const lifetime = l.plan === "lifetime";
  const d = lifetime ? null : daysLeft(l.expiration_date);

  const steps: { done: boolean; title: string; text: string }[] = [
    { done: true, title: "License issued", text: `Started ${dmy(l.start_date)}.` },
    { done: !!l.mt5_account, title: "MT5 account linked", text: l.mt5_account ? `Locked to ${l.mt5_account}.` : "Enter your account number below to create your key." },
    { done: l.activation_status === "activated", title: "EA activated", text: l.activation_status === "activated" ? `Verified ${dt(l.last_validated_at ?? l.activated_at)}.` : "Attach the EA to a chart and paste your key." },
  ];

  const details: { icon: IconName; label: string; value: string; mono?: boolean }[] = [
    { icon: "key", label: "License ID", value: l.license_ref, mono: true },
    { icon: "box", label: "Product", value: "3MIN SCALP" },
    { icon: "renew", label: "Started", value: dmy(l.start_date) },
    { icon: "clock", label: lifetime ? "Access" : "Valid until", value: lifetime ? "Lifetime, never expires" : dt(l.expiration_date) },
    { icon: "chip", label: "MT5 account", value: l.mt5_account ?? "Not set yet", mono: true },
    { icon: "check", label: "EA verification", value: l.last_validated_at ? `Last seen ${dt(l.last_validated_at)}` : "Not seen yet" },
  ];

  return (
    <>
      <Link href="/dashboard/license" className="inline-flex min-h-[40px] items-center text-sm font-semibold text-accent">‹ All licenses</Link>

      <article className="mt-2 overflow-hidden rounded-3xl border border-line bg-bg shadow-lg shadow-black/20">
        <div className="relative overflow-hidden bg-gradient-to-br from-forest via-[#14261D] to-bg2 p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-accent/10" aria-hidden="true" />
          <div className="relative flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5"><LogoMark size={34} /><span className="text-[13px] font-bold tracking-[0.14em]">3MIN <span className="text-accent">SCALP</span></span></span>
            <StatusPill state={l.state} />
          </div>
          <div className="relative mt-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-ink/60">{lifetime ? "Lifetime license" : "Monthly license"}</p>
              <h1 className="font-display text-3xl font-bold capitalize tracking-tight sm:text-4xl">{l.plan}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-2"><span className="break-all font-mono text-[13px] text-ink/80">{l.license_ref}</span>
                <CopyButton value={l.license_ref} label="Copy ID" className="rounded-full border border-ink/20 px-2.5 py-0.5 text-xs font-medium text-ink/70 active:bg-black/20" /></p>
            </div>
            <Ring days={d} lifetime={lifetime} />
          </div>
        </div>
        <div className="p-5 sm:p-6">
          {lifetime ? (
            <p className="flex items-center gap-2.5 text-[15px] font-medium"><span className="text-accent"><Ico name="check" /></span>Lifetime access. This license never expires.</p>
          ) : l.expiration_date ? <Countdown to={l.expiration_date} /> : null}
        </div>
      </article>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line bg-bg p-5" aria-label="EA license key">
            <h2 className="font-display text-lg font-semibold">EA license key</h2>
            <p className="mt-0.5 text-sm text-muted">{l.mt5_account ? "Paste this key into the EA inputs on your MT5 account." : "Enter your MT5 account number to create your key."}</p>
            {l.state === "active" ? <RevealKey licenseId={l.id} boundAccount={l.mt5_account} /> : (
              <p className="mt-4 rounded-xl border border-line bg-bg2/60 p-4 text-sm text-muted">The key is hidden while this license is {l.state}.{l.state === "expired" ? " Renew it to get a working key." : " Contact support if you think this is a mistake."}</p>
            )}
            {!lifetime && <p className="mt-4 text-xs leading-relaxed text-muted">The key changes after each renewal. Come back here and copy the new one.</p>}
          </section>

          <section className="rounded-2xl border border-line bg-bg p-5" aria-label="License details">
            <h2 className="font-display text-lg font-semibold">License details</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {details.map((x) => (
                <div key={x.label} className="flex items-center gap-3 rounded-xl bg-bg2/60 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest/50 text-accent"><Ico name={x.icon} /></span>
                  <div className="min-w-0"><dt className="text-xs text-muted">{x.label}</dt><dd className={`truncate text-sm font-semibold ${x.mono ? "font-mono" : ""}`}>{x.value}</dd></div>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-bg p-5" aria-label="Payment history">
            <h2 className="font-display text-lg font-semibold">Payment history</h2>
            {payments.length === 0 ? <p className="mt-3 text-sm text-muted">No payments recorded for this license yet.</p> : (
              <ul className="mt-3 divide-y divide-line">
                {payments.map((p) => (
                  <li key={p.order_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold capitalize">{p.plan} · ${Number(p.amount_usd).toFixed(2)}</p>
                      <p className="text-xs text-muted">{dmy(p.confirmed_at ?? p.created_at)} · {p.coin} on {p.network} · <span className="font-mono">{p.order_id}</span></p>
                    </div>
                    <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">{PAY[p.order_status] ?? p.order_status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-bg p-4" aria-label="Setup progress">
            <h2 className="font-display text-lg font-semibold">Setup progress</h2>
            <ol className="mt-3 space-y-3">
              {steps.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${s.done ? "bg-accent text-bg" : "border border-line text-muted"}`}>{s.done ? <Ico name="check" size={15} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span>
                  <div className="min-w-0"><p className="text-sm font-semibold">{s.title}</p><p className="text-xs leading-relaxed text-muted">{s.text}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="space-y-2" aria-label="Actions">
            {!lifetime && l.state !== "revoked" && <Link href={`/dashboard/renew?license=${l.id}`} className="flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-accent text-[15px] font-semibold text-bg active:brightness-95"><Ico name="renew" size={18} />Renew this license</Link>}
            {l.state === "active" && <Link href="/dashboard/downloads" className={row}><span className="text-accent"><Ico name="download" /></span>Download EA</Link>}
            {!lifetime && l.expiration_date && l.state === "active" && (
              <CalendarReminder expires={l.expiration_date} refId={l.license_ref} className={`${row} w-full text-left`}><span className="text-accent"><Ico name="clock" /></span>Add renewal reminder to calendar</CalendarReminder>
            )}
            <Link href="/dashboard/documentation" className={row}><span className="text-accent"><Ico name="book" /></span>Installation guide</Link>
            <OpenChatButton className={`${row} w-full text-left`}><span className="text-accent"><Ico name="help" /></span>Ask support about this license</OpenChatButton>
          </section>

          <section className="rounded-2xl border border-line bg-bg p-4 text-xs leading-relaxed text-muted" aria-label="Security">
            <p className="text-sm font-semibold text-ink">Keep it safe</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-4">
              <li>Never share your key. It works only on the MT5 account shown here.</li>
              <li>To move to another MT5 account, contact support.</li>
              <li>We will never ask for your password or seed phrase.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
