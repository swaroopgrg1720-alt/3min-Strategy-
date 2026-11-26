import { requireUser, isAdminEmail } from "@/lib/auth";
import Link from "next/link";
import { Ico, PageHeader, dmy } from "@/components/dashboard/ui";
import { ChangePassword } from "@/components/dashboard/ChangePassword";
import { signOutEverywhere } from "./actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await requireUser();
  const email = user.email ?? "";
  return (
    <>
      <PageHeader title="Account" text="Your sign-in details." />
      <section className="max-w-xl rounded-2xl border border-line bg-bg p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent font-display text-xl font-bold text-bg" aria-hidden="true">{email.charAt(0).toUpperCase() || "A"}</span>
          <div className="min-w-0"><p className="truncate font-display text-lg font-semibold">{email.split("@")[0]}</p><p className="truncate text-sm text-muted">{email}</p></div>
        </div>
        <dl className="mt-5 divide-y divide-line text-sm">
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Email</dt><dd className="truncate font-medium">{email}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Member since</dt><dd className="font-medium">{dmy(user.created_at)}</dd></div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-muted">Licenses are linked to this email. Use the same email you bought with.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {isAdminEmail(email) && <Link href="/admin" className="inline-flex min-h-[46px] items-center gap-2 rounded-full border border-line px-5 text-sm font-semibold active:bg-forest/40"><Ico name="user" size={18} />Admin panel</Link>}
          <form action="/auth/signout" method="post"><button className="inline-flex min-h-[46px] items-center rounded-full bg-red-400/10 px-5 text-sm font-semibold text-red-300 active:bg-red-400/20">Sign out</button></form>
        </div>
      </section>

      <section className="mt-6 max-w-xl rounded-2xl border border-line bg-bg p-5" aria-label="Security">
        <h2 className="font-display text-lg font-semibold">Password</h2>
        <p className="mb-4 mt-0.5 text-sm text-muted">Use a long, unique password that you do not use anywhere else.</p>
        <ChangePassword />
      </section>

      <section className="mt-6 max-w-xl rounded-2xl border border-line bg-bg p-5" aria-label="Devices">
        <h2 className="font-display text-lg font-semibold">Signed-in devices</h2>
        <p className="mb-4 mt-0.5 text-sm text-muted">Lost a phone or used a shared computer? Sign out everywhere, then sign in again.</p>
        <form action={signOutEverywhere}><button className="inline-flex min-h-[46px] items-center rounded-full border border-red-400/30 px-5 text-sm font-semibold text-red-300 active:bg-red-400/10">Sign out on all devices</button></form>
      </section>
    </>
  );
}
