import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Chips, EmptyState, FlashBanner, PageHead, backTo, fmtDateTime, smallBtn, smallPrimary, type AdminSearch } from "@/components/admin/ui";
import { setTicketStatusAction } from "../actions";

export const metadata: Metadata = { title: "Support | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const { data, error } = await supabaseAdmin().from("support_tickets").select("*").order("created_at", { ascending: false }).limit(200);
  const all = data ?? [];
  const status = ["open", "answered", "closed", "all"].includes(sp.status ?? "") ? (sp.status as string) : "open";
  const rows = status === "all" ? all : all.filter((t) => t.status === status);
  const count = (s: string) => all.filter((t) => t.status === s).length;
  const back = backTo("/admin/support", { status: status === "open" ? undefined : status });
  const btn = (t: { id: string }, next: string, label: string, primary = false) => (
    <form action={setTicketStatusAction}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="status" value={next} /><input type="hidden" name="back" value={back} />
      <SubmitButton className={primary ? smallPrimary : smallBtn}>{label}</SubmitButton></form>
  );

  return (
    <>
      <PageHead title="Support" text="Messages customers send from the contact and support forms." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error ?? error?.message} />
      <Chips base="/admin/support" param="status" active={status} options={[
        { value: "open", label: "Open", count: count("open") }, { value: "answered", label: "Answered", count: count("answered") },
        { value: "closed", label: "Closed", count: count("closed") }, { value: "all", label: "All", count: all.length },
      ]} />
      {rows.length === 0 ? <EmptyState title="Nothing here" text="New messages from customers show up in this list." /> : (
        <ul className="space-y-3">
          {rows.map((t) => (
            <li key={t.id} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0"><p className="font-semibold">{t.subject}</p><p className="break-all text-sm text-muted">{t.name ? `${t.name} · ` : ""}{t.customer_email}</p></div>
                <Badge tone={t.status === "open" ? "warn" : t.status === "answered" ? "good" : "neutral"}>{t.status[0].toUpperCase() + t.status.slice(1)}</Badge>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-muted">{t.message}</p>
              <p className="mt-2 text-xs text-muted">{fmtDateTime(t.created_at)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a className={smallPrimary} href={`mailto:${t.customer_email}?subject=${encodeURIComponent(`Re: ${t.subject}`)}`}>Reply by email</a>
                {t.status !== "answered" && btn(t, "answered", "Mark answered")}
                {t.status === "closed" ? btn(t, "open", "Reopen") : btn(t, "closed", "Close")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
