"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { bySymbol, computeStats, toCsv, type Trade } from "@/lib/tools/stats";
import { EquityCurve } from "./EquityCurve";
import { ChipGroup, MiniStat, Panel, Segmented, inputBase } from "./kit";

const SYMBOLS = ["EURUSD", "GBPUSD", "XAUUSD"];
const fld = `${inputBase} mt-1.5 h-[52px]`;
const money = (v: number | null, d = 2) => (v == null ? "—" : v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }));
const signed = (v: number) => `${v >= 0 ? "+" : "-"}${money(Math.abs(v))}`;
const num = (v: FormDataEntryValue | null) => { const s = String(v ?? "").trim(); return s === "" ? null : Number(s); };
const localNow = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export function Journal() {
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [sym, setSym] = useState("EURUSD");
  const [other, setOther] = useState(false);
  const [dir, setDir] = useState<"buy" | "sell">("buy");
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    const { data, error: e } = await supabaseBrowser().from("journal_trades").select("*").order("opened_at", { ascending: false }).limit(2000);
    if (e) {
      setError(/relation|does not exist|schema cache/i.test(e.message) ? "The journal table is missing. Run supabase/migrations/002_journal.sql in the Supabase SQL Editor." : e.message);
      setTrades([]);
      return;
    }
    setTrades((data ?? []) as Trade[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const shown = useMemo(() => (trades ?? []).filter((t) => symbolFilter === "all" || t.symbol === symbolFilter), [trades, symbolFilter]);
  const stats = useMemo(() => computeStats(shown), [shown]);
  const symbols = useMemo(() => bySymbol(trades ?? []), [trades]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const pnl = num(f.get("pnl"));
    const symbol = String(f.get("symbol") ?? "").trim().toUpperCase();
    if (pnl == null || Number.isNaN(pnl) || !symbol) { setError("Symbol and net P&L are required."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabaseBrowser().from("journal_trades").insert({
      opened_at: new Date(String(f.get("opened_at"))).toISOString(),
      symbol, direction: f.get("direction") === "sell" ? "sell" : "buy",
      lots: num(f.get("lots")), entry_price: num(f.get("entry")), exit_price: num(f.get("exit")),
      stop_loss: num(f.get("sl")), take_profit: num(f.get("tp")), pnl, risk_amount: num(f.get("risk")),
      setup: String(f.get("setup") ?? "").trim().slice(0, 60) || null, notes: String(f.get("notes") ?? "").trim().slice(0, 2000) || null,
    });
    setSaving(false);
    if (err) { setError(err.message); return; }
    form.reset();
    setSym("EURUSD");
    setOther(false);
    setDir("buy");
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this trade?")) return;
    const { error: err } = await supabaseBrowser().from("journal_trades").delete().eq("id", id);
    if (err) setError(err.message); else setTrades((t) => (t ?? []).filter((x) => x.id !== id));
  }

  function exportCsv() {
    const url = URL.createObjectURL(new Blob([toCsv(shown)], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "3min-scalp-journal.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const pf = stats.profitFactor;
  const netTone = stats.net > 0 ? "text-accent" : stats.net < 0 ? "text-red-400" : "text-ink";
  const tone = (v: number | null): "good" | "bad" | "neutral" => (v == null || v === 0 ? "neutral" : v > 0 ? "good" : "bad");
  return (
    <div className="space-y-5">
      {error && <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">{error}</p>}

      <section aria-label="Performance summary" className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-forest/60 via-forest/20 to-bg2 p-6">
          <p className="text-sm font-medium text-muted">Net profit / loss</p>
          <p className={`mt-2 font-display text-5xl font-bold leading-none tracking-tight tabular-nums ${netTone}`}>{stats.count ? signed(stats.net) : "—"}</p>
          <p className="mt-3 text-sm text-muted">{stats.count} trade{stats.count === 1 ? "" : "s"}{stats.winRate == null ? "" : ` · ${(stats.winRate * 100).toFixed(1)}% win rate`}</p>
          <div className="mt-5">
            <ChipGroup label="Show" value={symbolFilter} onChange={setSymbolFilter} options={[{ value: "all", label: "All" }, ...symbols.map((s) => ({ value: s.symbol, label: s.symbol }))]} />
          </div>
        </div>
        <div className="rounded-3xl border border-line bg-bg2 p-5">
          <p className="mb-2 text-sm font-medium text-muted">Equity curve</p>
          <EquityCurve curve={stats.curve} />
        </div>
      </section>

      <section aria-label="Statistics" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniStat label="Profit factor" value={stats.count === 0 ? "—" : pf == null ? (stats.grossProfit > 0 ? "∞" : "—") : pf.toFixed(2)} />
        <MiniStat label="Expectancy / trade" value={money(stats.expectancy)} tone={tone(stats.expectancy)} />
        <MiniStat label="Average win" value={money(stats.avgWin)} tone="good" />
        <MiniStat label="Average loss" value={stats.avgLoss == null ? "—" : `-${money(stats.avgLoss)}`} tone={stats.avgLoss == null ? "neutral" : "bad"} />
        <MiniStat label="Average R" value={stats.avgR == null ? "—" : `${stats.avgR.toFixed(2)}R`} />
        <MiniStat label="Max drawdown" value={stats.count ? money(stats.maxDrawdown) : "—"} tone={stats.maxDrawdown > 0 ? "bad" : "neutral"} />
        <MiniStat label="Best trade" value={stats.count ? money(stats.best) : "—"} tone="good" />
        <MiniStat label="Worst trade" value={stats.count ? money(stats.worst) : "—"} tone="bad" />
      </section>
      <p className="-mt-2 text-xs text-muted">Calculated from the trades you enter, in your account currency. Average R uses trades where you entered the amount risked. Longest losing streak: {stats.maxLossStreak}.</p>

      <Panel title="Log a trade" action={<button type="button" onClick={() => setFormOpen((v) => !v)} aria-expanded={formOpen} className="btn btn-primary !min-h-[44px] !px-5 !py-2 !text-sm">{formOpen ? "Close" : "+ New trade"}</button>}>
        {!formOpen ? <p className="text-sm text-muted">Record each trade as you close it. Your statistics and curve update instantly.</p> : (
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <ChipGroup label="Symbol" value={other ? "OTHER" : sym} onChange={(v) => { if (v === "OTHER") setOther(true); else { setOther(false); setSym(v); } }} options={[...SYMBOLS.map((s) => ({ value: s, label: s })), { value: "OTHER", label: "Other" }]} />
              {other ? <input name="symbol" required maxLength={20} placeholder="e.g. USDJPY" className={fld} /> : <input type="hidden" name="symbol" value={sym} />}
            </div>
            <div className="sm:col-span-2">
              <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: "buy", label: "Buy" }, { value: "sell", label: "Sell", tone: "bad" }]} />
              <input type="hidden" name="direction" value={dir} />
            </div>
            <label className="text-sm text-muted sm:col-span-2">Opened<input name="opened_at" type="datetime-local" defaultValue={localNow()} required className={fld} /></label>
            <label className="text-sm text-muted">Lots<input name="lots" inputMode="decimal" type="number" step="0.01" min="0" className={fld} /></label>
            <label className="text-sm text-muted">Net P&amp;L (after fees) *<input name="pnl" inputMode="decimal" type="number" step="0.01" required className={fld} placeholder="-25.00 or 60.50" /></label>
            <label className="text-sm text-muted">Entry price<input name="entry" inputMode="decimal" type="number" step="any" className={fld} /></label>
            <label className="text-sm text-muted">Exit price<input name="exit" inputMode="decimal" type="number" step="any" className={fld} /></label>
            <label className="text-sm text-muted">Stop loss<input name="sl" inputMode="decimal" type="number" step="any" className={fld} /></label>
            <label className="text-sm text-muted">Take profit<input name="tp" inputMode="decimal" type="number" step="any" className={fld} /></label>
            <label className="text-sm text-muted">Amount risked<input name="risk" inputMode="decimal" type="number" step="0.01" min="0.01" className={fld} placeholder="for R-multiple" /></label>
            <label className="text-sm text-muted sm:col-span-2">Setup / tag<input name="setup" maxLength={60} className={fld} placeholder="e.g. London open" /></label>
            <label className="text-sm text-muted sm:col-span-2 lg:col-span-4">Notes<textarea name="notes" rows={2} maxLength={2000} className={`${inputBase} mt-1.5 py-3 text-base`} placeholder="What went well? What would you change?" /></label>
            <div className="sm:col-span-2 lg:col-span-4"><button className="btn btn-primary w-full disabled:opacity-60 sm:w-auto" disabled={saving}>{saving ? "Saving…" : "Save trade"}</button></div>
          </form>
        )}
      </Panel>

      {symbols.length > 1 && (
        <Panel title="By symbol">
          <ul className="grid gap-3 sm:grid-cols-3">
            {symbols.map((s) => (
              <li key={s.symbol} className="rounded-2xl border border-line bg-bg p-4">
                <p className="font-display font-semibold">{s.symbol}</p>
                <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${s.net >= 0 ? "text-accent" : "text-red-400"}`}>{signed(s.net)}</p>
                <p className="mt-1 text-xs text-muted">{s.count} trades · {((s.wins / s.count) * 100).toFixed(0)}% wins</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Trade history" action={<button onClick={exportCsv} disabled={shown.length === 0} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted active:bg-forest/40 disabled:opacity-40">Export CSV</button>}>
        {trades === null ? <p className="py-8 text-center text-sm text-muted">Loading your trades…</p> : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center"><p className="font-semibold">No trades yet</p><p className="mt-1 text-sm text-muted">Tap “+ New trade” above to log your first one.</p></div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {shown.map((t) => {
              const pnl = Number(t.pnl);
              return (
                <li key={t.id} className="rounded-2xl border border-line bg-bg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 font-display font-semibold">{t.symbol}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.direction === "buy" ? "bg-accent/15 text-accent" : "bg-red-400/15 text-red-300"}`}>{t.direction === "buy" ? "Buy" : "Sell"}</span></p>
                      <p className="mt-0.5 text-xs text-muted">{new Date(t.opened_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p>
                    </div>
                    <p className={`font-display text-xl font-bold tabular-nums ${pnl >= 0 ? "text-accent" : "text-red-400"}`}>{signed(pnl)}</p>
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    {[t.lots ? `${t.lots} lots` : null, t.entry_price ? `in ${t.entry_price}` : null, t.exit_price ? `out ${t.exit_price}` : null, t.risk_amount ? `${(pnl / Number(t.risk_amount)).toFixed(2)}R` : null, t.setup].filter(Boolean).join(" · ") || "No extra details"}
                  </p>
                  {t.notes && <p className="mt-2 text-sm text-muted">{t.notes}</p>}
                  <button onClick={() => remove(t.id)} aria-label={`Delete ${t.symbol} trade`} className="mt-3 rounded-full border border-line px-3 py-1.5 text-xs text-muted active:border-red-400/50 active:text-red-300">Delete</button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
      <p className="text-xs text-muted">Your journal is private to your account. It is a record-keeping tool, not financial advice, and it does not read your MT5 account automatically.</p>
    </div>
  );
}
