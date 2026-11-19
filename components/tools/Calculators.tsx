"use client";
import { useState } from "react";
import { expectancyR, INSTRUMENTS, positionSize, recoveryPct, riskReward, tradePnl, type InstrumentId } from "@/lib/tools/calc";

const input = "mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm focus:border-accent/60";
const n = (s: string) => (s.trim() === "" ? NaN : Number(s));
const fix = (v: number, d = 2) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

function Field({ label, value, set, step = "any", hint }: { label: string; value: string; set: (v: string) => void; step?: string; hint?: string }) {
  return (
    <label className="block text-sm">{label}
      <input inputMode="decimal" type="number" step={step} value={value} onChange={(e) => set(e.target.value)} className={input} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
function Result({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-bold text-accent ${big ? "text-3xl" : "text-xl"}`}>{value}</p>
    </div>
  );
}
function InstrumentSelect({ id, set }: { id: InstrumentId; set: (v: InstrumentId) => void }) {
  return (
    <label className="block text-sm">Instrument
      <select value={id} onChange={(e) => set(e.target.value as InstrumentId)} className={input}>
        {(Object.keys(INSTRUMENTS) as InstrumentId[]).map((k) => <option key={k} value={k}>{INSTRUMENTS[k].label}</option>)}
      </select>
    </label>
  );
}

function PositionSize() {
  const [inst, setInst] = useState<InstrumentId>("EURUSD");
  const [bal, setBal] = useState("10000"), [risk, setRisk] = useState("1"), [entry, setEntry] = useState(""), [stop, setStop] = useState("");
  const r = positionSize({ balance: n(bal), riskPct: n(risk), entry: n(entry), stop: n(stop), contractSize: INSTRUMENTS[inst].contractSize });
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <InstrumentSelect id={inst} set={setInst} />
        <Field label="Account balance (USD)" value={bal} set={setBal} />
        <Field label="Risk per trade (%)" value={risk} set={setRisk} step="0.1" />
        <Field label="Entry price" value={entry} set={setEntry} />
        <Field label="Stop-loss price" value={stop} set={setStop} />
      </div>
      <div className="space-y-3">
        <Result big label="Position size" value={r ? `${fix(r.lotsRounded)} lots` : "—"} />
        <div className="grid grid-cols-2 gap-3">
          <Result label="Amount at risk" value={r ? `$${fix(r.riskAmount)}` : "—"} />
          <Result label="Stop distance" value={r ? fix(r.distance, INSTRUMENTS[inst].decimals) : "—"} />
        </div>
        <p className="text-xs leading-relaxed text-muted">Assumes a USD account and a standard contract ({INSTRUMENTS[inst].contractSize.toLocaleString()} units per lot). Rounded down to 0.01 lots. Your broker&apos;s contract size, spread and slippage can change the real risk. Verify on a demo account.</p>
      </div>
    </div>
  );
}

function RiskRewardCalc() {
  const [entry, setEntry] = useState(""), [stop, setStop] = useState(""), [tp, setTp] = useState(""), [wr, setWr] = useState("50");
  const r = riskReward(n(entry), n(stop), n(tp));
  const w = n(wr) / 100;
  const e = r && w >= 0 && w <= 1 ? expectancyR(w, r.rr) : null;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Entry price" value={entry} set={setEntry} />
        <Field label="Stop-loss price" value={stop} set={setStop} />
        <Field label="Take-profit price" value={tp} set={setTp} />
        <Field label="Your win rate (%)" value={wr} set={setWr} hint="Use your own measured win rate, for example from the journal." />
      </div>
      <div className="space-y-3">
        <Result big label="Reward : risk" value={r ? `${fix(r.rr)} : 1` : "—"} />
        <div className="grid grid-cols-2 gap-3">
          <Result label="Break-even win rate" value={r ? `${fix(r.breakEvenWinRate * 100, 1)}%` : "—"} />
          <Result label="Expectancy" value={e == null ? "—" : `${e >= 0 ? "+" : ""}${fix(e)}R / trade`} />
        </div>
        <p className="text-xs leading-relaxed text-muted">A positive expectancy needs a win rate above the break-even rate. Results from past trades don&apos;t guarantee future results.</p>
      </div>
    </div>
  );
}

function PnlCalc() {
  const [inst, setInst] = useState<InstrumentId>("XAUUSD");
  const [dir, setDir] = useState<"buy" | "sell">("buy");
  const [lots, setLots] = useState("0.10"), [entry, setEntry] = useState(""), [exit, setExit] = useState("");
  const ok = n(lots) > 0 && !Number.isNaN(n(entry)) && !Number.isNaN(n(exit));
  const p = ok ? tradePnl(dir, n(lots), n(entry), n(exit), INSTRUMENTS[inst].contractSize) : null;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <InstrumentSelect id={inst} set={setInst} />
        <label className="block text-sm">Direction
          <select value={dir} onChange={(e) => setDir(e.target.value as "buy" | "sell")} className={input}><option value="buy">Buy</option><option value="sell">Sell</option></select>
        </label>
        <Field label="Lots" value={lots} set={setLots} step="0.01" />
        <Field label="Entry price" value={entry} set={setEntry} />
        <Field label="Exit price" value={exit} set={setExit} />
      </div>
      <div className="space-y-3">
        <Result big label="Profit / loss (before fees)" value={p == null ? "—" : `${p >= 0 ? "+" : "-"}$${fix(Math.abs(p))}`} />
        <p className="text-xs leading-relaxed text-muted">USD account, standard contract size. Excludes spread, commission and swap.</p>
      </div>
    </div>
  );
}

function Drawdown() {
  const [dd, setDd] = useState("20");
  const r = recoveryPct(n(dd));
  const rows = [5, 10, 20, 30, 50, 70];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Drawdown (%)" value={dd} set={setDd} hint="How far the account has fallen from its peak." />
        <Result big label="Gain needed to recover" value={r == null ? "—" : `${fix(r, 1)}%`} />
      </div>
      <div>
        <table className="w-full text-left text-sm">
          <thead><tr className="text-xs uppercase tracking-wider text-muted"><th className="py-2 font-medium">Drawdown</th><th className="py-2 font-medium">Recovery needed</th></tr></thead>
          <tbody>{rows.map((d) => <tr key={d} className="border-t border-line"><td className="py-2">{d}%</td><td className="py-2">{fix(recoveryPct(d) ?? 0, 1)}%</td></tr>)}</tbody>
        </table>
        <p className="mt-3 text-xs text-muted">Losses are harder to recover than they look, which is why risk per trade matters.</p>
      </div>
    </div>
  );
}

const TABS = [
  { id: "size", label: "Position size", C: PositionSize },
  { id: "rr", label: "Risk / reward", C: RiskRewardCalc },
  { id: "pnl", label: "Profit / loss", C: PnlCalc },
  { id: "dd", label: "Drawdown recovery", C: Drawdown },
] as const;

export function Calculators() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("size");
  const Active = TABS.find((t) => t.id === tab)!.C;
  return (
    <div>
      <div role="tablist" aria-label="Trading tools" className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`btn !py-2 whitespace-nowrap ${tab === t.id ? "btn-primary" : "btn-ghost"}`}>{t.label}</button>
        ))}
      </div>
      <div role="tabpanel" className="card mt-4"><Active /></div>
      <p className="mt-4 text-xs text-muted">Educational calculators only. They are not financial advice and do not guarantee any result. Check every number against your broker&apos;s specifications.</p>
    </div>
  );
}
