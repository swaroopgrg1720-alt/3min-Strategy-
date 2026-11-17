"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { bySymbol, computeStats, toCsv, type Trade } from "@/lib/tools/stats";
import { EquityCurve } from "./EquityCurve";

const SYMBOLS = ["EURUSD", "GBPUSD", "XAUUSD"];
const input = "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm focus:border-accent/60";
const money = (v: number | null, d = 2) => (v == null ? "—" : v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }));
const num = (v: FormDataEntryValue | null) => { const s = String(v ?? "").trim(); return s === "" ? null : Number(s); };
const localNow = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "bad" }) {
  return (
    <div className="card !p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1.5 text-xl font-bold ${tone === "good" ? "text-accent" : tone === "bad" ? "text-red-400" : ""}`}>{value}</p>
    </div>
  );
}

export function Journal() {
  const [trades, setTrades] = useState<Trade[] | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [symbolFilter, setSymbolFilter] = useState("all");
  const [customSymbol, setCustomSymbol] = useState(false);

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
    setCustomSymbol(false);
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
  return (
    <div className="space-y-6">
      {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">{error}</p>}

      <section aria-label="Performance summary">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your statistics</h2>
          <label className="flex items-center gap-2 text-sm text-muted">Symbol
            <select value={symbolFilter} onChange={(e) => setSymbolFilter(e.target.value)} className="rounded-lg border border-line bg-bg px-3 py-1.5 text-ink">
              <option value="all">All</option>
              {symbols.map((s) => <option key={s.symbol}>{s.symbol}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Net P&L" value={money(stats.net)} tone={stats.net > 0 ? "good" : stats.net < 0 ? "bad" : undefined} />
          <Stat label="Trades" value={String(stats.count)} />
          <Stat label="Win rate" value={stats.winRate == null ? "—" : `${(stats.winRate * 100).toFixed(1)}%`} />
          <Stat label="Profit factor" value={stats.count === 0 ? "—" : pf == null ? (stats.grossProfit > 0 ? "∞" : "—") : pf.toFixed(2)} />
          <Stat label="Avg win" value={money(stats.avgWin)} />
          <Stat label="Avg loss" value={stats.avgLoss == null ? "—" : `-${money(stats.avgLoss)}`} />
          <Stat label="Expectancy / trade" value={money(stats.expectancy)} />
          <Stat label="Avg R" value={stats.avgR == null ? "—" : `${stats.avgR.toFixed(2)}R`} />
          <Stat label="Max drawdown" value={stats.count ? money(stats.maxDrawdown) : "—"} tone={stats.maxDrawdown > 0 ? "bad" : undefined} />
          <Stat label="Best trade" value={money(stats.best)} />
          <Stat label="Worst trade" value={money(stats.worst)} />
          <Stat label="Longest losing streak" value={String(stats.maxLossStreak)} />
        </div>
        <p className="mt-2 text-xs text-muted">Calculated from the trades you enter. Values are in your account currency. Avg R uses trades where you entered the amount risked.</p>
      </section>

      <section className="card" aria-label="Equity curve">
        <h2 className="text-lg font-semibold">Equity curve</h2>
        <p className="text-xs text-muted">Cumulative net P&L of your logged trades.</p>
        <div className="mt-3"><EquityCurve curve={stats.curve} /></div>
      </section>

      <section className="card" aria-label="Add trade">
        <h2 className="text-lg font-semibold">Log a trade</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">Opened<input name="opened_at" type="datetime-local" defaultValue={localNow()} required className={input} /></label>
          <label className="text-sm">Symbol
            {customSymbol
              ? <input name="symbol" required maxLength={20} placeholder="e.g. USDJPY" className={input} />
              : <select name="symbol" className={input} onChange={(e) => e.target.value === "__other" && setCustomSymbol(true)}>{SYMBOLS.map((s) => <option key={s}>{s}</option>)}<option value="__other">Other…</option></select>}
          </label>
          <label className="text-sm">Direction<select name="direction" className={input}><option value="buy">Buy</option><option value="sell">Sell</option></select></label>
          <label className="text-sm">Lots<input name="lots" type="number" step="0.01" min="0" className={input} /></label>
          <label className="text-sm">Entry price<input name="entry" type="number" step="any" className={input} /></label>
          <label className="text-sm">Exit price<input name="exit" type="number" step="any" className={input} /></label>
          <label className="text-sm">Stop loss<input name="sl" type="number" step="any" className={input} /></label>
          <label className="text-sm">Take profit<input name="tp" type="number" step="any" className={input} /></label>
          <label className="text-sm">Net P&amp;L (after fees) *<input name="pnl" type="number" step="0.01" required className={input} placeholder="-25.00 or 60.50" /></label>
          <label className="text-sm">Amount risked<input name="risk" type="number" step="0.01" min="0.01" className={input} placeholder="for R-multiple" /></label>
          <label className="text-sm">Setup / tag<input name="setup" maxLength={60} className={input} placeholder="e.g. London open" /></label>
          <label className="text-sm sm:col-span-2 lg:col-span-4">Notes<textarea name="notes" rows={2} maxLength={2000} className={input} placeholder="What went well? What would you change?" /></label>
          <div className="sm:col-span-2 lg:col-span-4"><button className="btn btn-primary disabled:opacity-60" disabled={saving}>{saving ? "Saving…" : "Save trade"}</button></div>
        </form>
      </section>

      {symbols.length > 1 && (
        <section className="card overflow-x-auto" aria-label="By symbol">
          <h2 className="text-lg font-semibold">By symbol</h2>
          <table className="mt-3 w-full min-w-[360px] text-left text-sm">
            <thead><tr className="text-xs uppercase tracking-wider text-muted"><th className="py-2 pr-4 font-medium">Symbol</th><th className="py-2 pr-4 font-medium">Trades</th><th className="py-2 pr-4 font-medium">Win rate</th><th className="py-2 font-medium">Net</th></tr></thead>
            <tbody>{symbols.map((s) => <tr key={s.symbol} className="border-t border-line"><td className="py-2 pr-4">{s.symbol}</td><td className="py-2 pr-4">{s.count}</td><td className="py-2 pr-4">{((s.wins / s.count) * 100).toFixed(0)}%</td><td className={`py-2 ${s.net >= 0 ? "text-accent" : "text-red-400"}`}>{money(s.net)}</td></tr>)}</tbody>
          </table>
        </section>
      )}

      <section className="card overflow-x-auto" aria-label="Trade history">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Trade history</h2>
          <button onClick={exportCsv} disabled={shown.length === 0} className="btn btn-ghost !py-2 disabled:opacity-50">Export CSV</button>
        </div>
        {trades === null ? <p className="py-8 text-sm text-muted">Loading…</p> : shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No trades yet. Log your first trade above.</p>
        ) : (
          <table className="mt-3 w-full min-w-[720px] text-left text-sm">
            <thead><tr className="text-xs uppercase tracking-wider text-muted">{["Date", "Symbol", "Side", "Lots", "Entry", "Exit", "Net P&L", "R", "Setup", ""].map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {shown.map((t) => (
                <tr key={t.id} className="border-t border-line align-top" title={t.notes ?? undefined}>
                  <td className="whitespace-nowrap py-2 pr-3">{new Date(t.opened_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="py-2 pr-3 font-medium">{t.symbol}</td>
                  <td className="py-2 pr-3 capitalize">{t.direction}</td>
                  <td className="py-2 pr-3">{t.lots ?? "—"}</td><td className="py-2 pr-3">{t.entry_price ?? "—"}</td><td className="py-2 pr-3">{t.exit_price ?? "—"}</td>
                  <td className={`py-2 pr-3 font-semibold ${Number(t.pnl) >= 0 ? "text-accent" : "text-red-400"}`}>{money(Number(t.pnl))}</td>
                  <td className="py-2 pr-3">{t.risk_amount ? `${(Number(t.pnl) / Number(t.risk_amount)).toFixed(2)}R` : "—"}</td>
                  <td className="py-2 pr-3 text-muted">{t.setup ?? ""}</td>
                  <td className="py-2"><button onClick={() => remove(t.id)} aria-label={`Delete ${t.symbol} trade`} className="rounded-lg border border-line px-2 py-1 text-xs text-muted hover:border-red-400/50 hover:text-red-300">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <p className="text-xs text-muted">Your journal is private to your account. It is a record-keeping tool, not financial advice, and it does not read your MT5 account automatically.</p>
    </div>
  );
}
