import Link from "next/link";
import { Ico, PageHeader } from "@/components/dashboard/ui";
import { OpenChatButton } from "@/components/dashboard/OpenChatButton";

export default function Page() {
  const card = "flex flex-col rounded-2xl border border-line bg-bg p-5";
  const icon = "flex h-12 w-12 items-center justify-center rounded-xl bg-forest/60 text-accent";
  return (
    <>
      <PageHeader title="Support" text="Get help with licenses, payments or setup." />
      <div className="grid gap-4 md:grid-cols-3">
        <section className={card}>
          <span className={icon}><Ico name="help" size={24} /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Live chat</h2>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">The fastest way to reach us. Your messages and our replies are saved.</p>
          <OpenChatButton className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-bg active:brightness-95">Start a chat</OpenChatButton>
        </section>
        <section className={card}>
          <span className={icon}><Ico name="mail" size={24} /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Contact form</h2>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">Prefer email? Send us the details and include your order email.</p>
          <Link href="/contact" className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40">Contact support</Link>
        </section>
        <section className={card}>
          <span className={icon}><Ico name="book" size={24} /></span>
          <h2 className="mt-4 font-display text-lg font-semibold">Guides</h2>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">Step by step help for installing and running the EA.</p>
          <Link href="/dashboard/documentation" className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40">Open documentation</Link>
        </section>
      </div>
      <p className="mt-5 text-xs text-muted">When you write to us about a payment, include your order email and the transaction ID. Never share your password or seed phrase.</p>
    </>
  );
}
