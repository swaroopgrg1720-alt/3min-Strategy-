import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { Badge, Chips, EmptyState, FlashBanner, PageHead, backTo, fmtDate, fmtDateTime, smallBtn, smallPrimary, type AdminSearch, type Tone } from "@/components/admin/ui";
import { deleteIndicatorAction, extendIndicatorAction, grantIndicatorAction, setIndicatorStatusAction } from "../actions";

export const metadata: Metadata = { title: "Indicator | Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<AdminSearch> }) {
  const sp = await searchParams;
  await requireAdmin();
  const { data, error } = await supabaseAdmin().from("indicator_access").select("*").order("created_at", { ascending: false }).limit(300);
  const all = (data ?? []).map((a) => ({ ...a, state: a.status === "active" && a.expires_at && Date.parse(a.expires_at) < Date.now() ? "expired" : (a.status as string) }));
  const status = ["pending", "active", "expired", "revoked", "all"].includes(sp.status ?? "") ? (sp.status as string) : "pending";
  const rows = status === "all" ? all : all.filter((a) => a.state === status);
  const count = (s: string) => all.filter((a) => a.state === s).length;
  const back = backTo("/admin/indicator", { status: status === "pending" ? undefined : status });
  const tone = (s: string): Tone => (s === "active" ? "good" : s === "pending" ? "warn" : s === "expired" ? "neutral" : "bad");
  const btn = (action: (f: FormData) => Promise<void>, id: string, label: string, extra: Record<string, string> = {}, primary = false, confirm?: string) => (
    <form action={action}><input type="hidden" name="id" value={id} /><input type="hidden" name="back" value={back} />
      {Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitButton className={primary ? smallPrimary : smallBtn} confirm={confirm}>{label}</SubmitButton></form>
  );

  return (
    <>
      <PageHead title="TradingView indicator" text="Customers who paid for the indicator. Add their username in TradingView, then mark it as granted." />
      <FlashBanner ok={sp.ok} info={sp.info} error={sp.error ?? error?.message} />
      <Chips base="/admin/indicator" param="status" active={status} options={[
        { value: "pending", label: "To grant", count: count("pending") }, { value: "active", label: "Active", count: count("active") },
        { value: "expired", label: "Expired", count: count("expired") }, { value: "revoked", label: "Revoked", count: count("revoked") }, { value: "all", label: "All", count: all.length },
      ]} />
      {rows.length === 0 ? <EmptyState title="Nothing here" text="Paid indicator orders show up in this list." /> : (
        <ul className="space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="break-all font-mono text-lg text-accent">@{a.tv_username}</p>
                  <p className="break-all text-sm text-muted">{a.customer_email}</p>
                </div>
                <Badge tone={tone(a.state)}>{a.state[0].toUpperCase() + a.state.slice(1)}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted">{a.plan === "lifetime" ? "Lifetime" : `Monthly, ${a.months} month${a.months === 1 ? "" : "s"} to add`} · Order {a.order_id} · {fmtDateTime(a.created_at)}</p>
              <p className="mt-1 text-sm text-muted">Expires: {a.plan === "lifetime" ? "never" : fmtDate(a.expires_at)}{a.granted_at ? ` · Granted ${fmtDate(a.granted_at)}` : ""}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a className={smallBtn} href={`https://www.tradingview.com/u/${encodeURIComponent(a.tv_username)}/`} target="_blank" rel="noopener noreferrer">Open TradingView profile</a>
                {a.state === "pending" && btn(grantIndicatorAction, a.id, "Mark as granted", {}, true)}
                {a.plan === "monthly" && a.state !== "revoked" && a.state !== "pending" && btn(extendIndicatorAction, a.id, "Extend 30 days")}
                {a.state === "revoked" ? btn(setIndicatorStatusAction, a.id, "Reactivate", { status: "active" }) : btn(setIndicatorStatusAction, a.id, "Revoke", { status: "revoked" }, false, "Revoke this access?")}
                {btn(deleteIndicatorAction, a.id, "Delete", {}, false, "Delete this record permanently?")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
