"use client";
import { useState } from "react";
import { expectancyR, INSTRUMENTS, positionSize, recoveryPct, riskReward, tradePnl, type InstrumentId } from "@/lib/tools/calc";
import { ChipGroup, HeroResult, MiniStat, Panel, Segmented, ToolInput } from "./kit";

const n = (s: string) => (s.trim() === "" ? NaN : Number(s));
const fix = (v: number, d = 2) => v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
const instOptions = (Object.keys(INSTRUMENTS) as InstrumentId[]).map((k) => ({ value: k, label: k }));
const NOTE = "text-xs leading-relaxed text-muted";

function InstrumentChips({ id, set }: { id: InstrumentId; set: (v: InstrumentId) => void }) {
  return <ChipGroup label="Instrument" value={id} options={instOptions} onChange={set} />;
}

function PositionSize() {
  const [inst, setInst] = useState<InstrumentId>("EURUSD");
  const [bal, setBal] = useState("10000"), [risk, setRisk] = useState("1"), [entry, setEntry] = useState(""), [stop, setStop] = useState("");
  const r = positionSize({ balance: n(bal), riskPct: n(risk), entry: n(entry), stop: n(stop), contractSize: INSTRUMENTS[inst].contractSize });
  const pct = n(risk);
  const meter = Number.isFinite(pct) ? Math.min(Math.max(pct, 0), 5) / 5 * 100 : 0;
  const meterColor = pct <= 1 ? "bg-accent" : pct <= 2 ? "bg-amber-300" : "bg-red-400";
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Your trade">
        <div className="space-y-5">
          <InstrumentChips id={inst} set={setInst} />
          <ToolInput label="Account balance" unit="USD" value={bal} set={setBal} />
          <div>
            <ToolInput label="Risk per trade" unit="%" value={risk} set={setRisk} step="0.1" />
            <div className="mt-3"><ChipGroup value={String(pct)} options={["0.5", "1", "2", "3"].map((v) => ({ value: v, label: `${v}%` }))} onChange={setRisk} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ToolInput label="Entry price" value={entry} set={setEntry} />
            <ToolInput label="Stop-loss price" value={stop} set={setStop} />
          </div>
        </div>
      </Panel>
      <div className="space-y-4">
        <HeroResult label="Position size" value={r ? `${fix(r.lotsRounded)} lots` : "—"} sub={r ? "Rounded down to 0.01 lots." : "Enter your entry and stop-loss prices."} copy={r ? `${fix(r.lotsRounded)} lots` : undefined} />
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Amount at risk" value={r ? `$${fix(r.riskAmount)}` : "—"} />
          <MiniStat label="Stop distance" value={r ? fix(r.distance, INSTRUMENTS[inst].decimals) : "—"} />
        </div>
        <div className="rounded-2xl border border-line bg-bg p-4">
          <div className="flex items-center justify-between text-xs text-muted"><span>Share of balance at risk</span><span className="font-semibold text-ink">{Number.isFinite(pct) ? `${fix(pct, 1)}%` : "—"}</span></div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true"><div className={`h-full rounded-full ${meterColor}`} style={{ width: `${meter}%` }} /></div>
          <div className="mt-1 flex justify-between text-[11px] text-muted" aria-hidden="true"><span>0%</span><span>5%</span></div>
        </div>
        <p className={NOTE}>Assumes a USD account and a standard contract ({INSTRUMENTS[inst].contractSize.toLocaleString()} units per lot). Your broker&apos;s contract size, spread and slippage can change the real risk. Verify on a demo account.</p>
      </div>
    </div>
  );
}

function RiskRewardCalc() {
  const [entry, setEntry] = useState(""), [stop, setStop] = useState(""), [tp, setTp] = useState(""), [wr, setWr] = useState("50");
  const r = riskReward(n(entry), n(stop), n(tp));
  const w = n(wr) / 100;
  const e = r && w >= 0 && w <= 1 ? expectancyR(w, r.rr) : null;
  const rewardShare = r ? Math.min(r.rr, 8) : 1;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Your trade">
        <div className="space-y-5">
          <ToolInput label="Entry price" value={entry} set={setEntry} />
          <div className="grid grid-cols-2 gap-3">
            <ToolInput label="Stop-loss price" value={stop} set={setStop} />
            <ToolInput label="Take-profit price" value={tp} set={setTp} />
          </div>
          <ToolInput label="Your win rate" unit="%" value={wr} set={setWr} hint="Use your own measured win rate, for example from the journal." />
        </div>
      </Panel>
      <div className="space-y-4">
        <HeroResult label="Reward : risk" value={r ? `${fix(r.rr)} : 1` : "—"} sub={r ? `For every $1 you risk, the target pays $${fix(r.rr)}.` : "Enter entry, stop-loss and take-profit."} copy={r ? `${fix(r.rr)} : 1` : undefined} />
        {r && (
          <div className="rounded-2xl border border-line bg-bg p-4" aria-hidden="true">
            <div className="flex h-8 overflow-hidden rounded-xl text-xs font-semibold text-bg">
              <div className="flex items-center justify-center bg-red-400" style={{ flex: 1 }}>Risk</div>
              <div className="flex items-center justify-center bg-accent" style={{ flex: rewardShare }}>Reward</div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <MiniStat label="Break-even win rate" value={r ? `${fix(r.breakEvenWinRate * 100, 1)}%` : "—"} />
          <MiniStat label="Expectancy" value={e == null ? "—" : `${e >= 0 ? "+" : ""}${fix(e)}R / trade`} tone={e == null ? "neutral" : e >= 0 ? "good" : "bad"} />
        </div>
        <p className={NOTE}>A positive expectancy needs a win rate above the break-even rate. Results from past trades don&apos;t guarantee future results.</p>
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
  const text = p == null ? "—" : `${p >= 0 ? "+" : "-"}$${fix(Math.abs(p))}`;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Your trade">
        <div className="space-y-5">
          <InstrumentChips id={inst} set={setInst} />
          <Segmented label="Direction" value={dir} onChange={setDir} options={[{ value: "buy", label: "Buy" }, { value: "sell", label: "Sell", tone: "bad" }]} />
          <ToolInput label="Size" unit="lots" value={lots} set={setLots} step="0.01" />
          <div className="grid grid-cols-2 gap-3">
            <ToolInput label="Entry price" value={entry} set={setEntry} />
            <ToolInput label="Exit price" value={exit} set={setExit} />
          </div>
        </div>
      </Panel>
      <div className="space-y-4">
        <HeroResult label="Profit / loss (before fees)" value={text} tone={p == null ? "neutral" : p >= 0 ? "good" : "bad"} sub={p == null ? "Enter the lots, entry and exit price." : p >= 0 ? "This trade would close in profit." : "This trade would close at a loss."} copy={p == null ? undefined : text} />
        <p className={NOTE}>USD account, standard contract size. Excludes spread, commission and swap.</p>
      </div>
    </div>
  );
}

function Drawdown() {
  const [dd, setDd] = useState("20");
  const r = recoveryPct(n(dd));
  const rows = [5, 10, 20, 30, 50, 70].map((d) => ({ d, rec: recoveryPct(d) ?? 0 }));
  const max = Math.max(...rows.map((x) => x.rec), r ?? 0);
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Your drawdown">
        <div className="space-y-5">
          <ToolInput label="Drawdown" unit="%" value={dd} set={setDd} hint="How far the account has fallen from its peak." />
          <ChipGroup value={dd} options={["5", "10", "20", "30", "50"].map((v) => ({ value: v, label: `${v}%` }))} onChange={setDd} />
        </div>
      </Panel>
      <div className="space-y-4">
        <HeroResult label="Gain needed to recover" value={r == null ? "—" : `${fix(r, 1)}%`} tone={r == null ? "neutral" : r > 50 ? "bad" : "good"} sub={r == null ? "Enter a drawdown between 0 and 100." : `After a ${fix(n(dd), 1)}% fall you need a ${fix(r, 1)}% gain to get back to even.`} copy={r == null ? undefined : `${fix(r, 1)}%`} />
        <div className="rounded-2xl border border-line bg-bg p-4">
          <ul className="space-y-3">
            {rows.map((x) => (
              <li key={x.d} className="grid grid-cols-[3rem_1fr_4rem] items-center gap-3 text-sm">
                <span className="text-muted">{x.d}%</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-line" aria-hidden="true"><span className="block h-full rounded-full bg-gradient-to-r from-accent to-red-400" style={{ width: `${(x.rec / max) * 100}%` }} /></span>
                <span className="text-right font-semibold tabular-nums">{fix(x.rec, 1)}%</span>
              </li>
            ))}
          </ul>
        </div>
        <p className={NOTE}>Losses are harder to recover than they look, which is why risk per trade matters.</p>
      </div>
    </div>
  );
}

const ICON = {
  size: ["M4 20 20 4", "M4 20h5", "M4 20v-5", "M20 4h-5", "M20 4v5"],
  rr: ["M4 12h16", "M8 8l-4 4 4 4", "M16 8l4 4-4 4"],
  pnl: ["M4 18 9 12l4 3 7-9", "M15 6h5v5"],
  dd: ["M4 6l6 6 4-3 6 8", "M20 12v5h-5"],
};
const TOOLS = [
  { id: "size", title: "Position size", desc: "Lots for your risk", C: PositionSize },
  { id: "rr", title: "Risk / reward", desc: "Is the trade worth it?", C: RiskRewardCalc },
  { id: "pnl", title: "Profit / loss", desc: "What a trade pays", C: PnlCalc },
  { id: "dd", title: "Drawdown", desc: "Gain to recover", C: Drawdown },
] as const;

export function Calculators() {
  const [tab, setTab] = useState<(typeof TOOLS)[number]["id"]>("size");
  const [nonce, setNonce] = useState(0);
  const active = TOOLS.find((t) => t.id === tab)!;
  const Active = active.C;
  return (
    <div>
      <div role="tablist" aria-label="Trading tools" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {TOOLS.map((t) => {
          const on = tab === t.id;
          return (
            <button key={t.id} role="tab" aria-selected={on} onClick={() => setTab(t.id)}
              className={`flex min-h-[92px] flex-col items-start justify-between rounded-3xl border p-4 text-left active:scale-[0.98] ${on ? "border-accent bg-forest/40 shadow-glow" : "border-line bg-bg2"}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={on ? "text-accent" : "text-muted"} aria-hidden="true">
                {ICON[t.id].map((d) => <path key={d} d={d} />)}
              </svg>
              <span><span className="block font-display text-[15px] font-semibold leading-tight">{t.title}</span><span className="mt-0.5 block text-xs text-muted">{t.desc}</span></span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{active.title}</h2>
        <button type="button" onClick={() => setNonce((v) => v + 1)} className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted active:bg-forest/40">Reset</button>
      </div>
      <div role="tabpanel" className="mt-4"><Active key={`${tab}-${nonce}`} /></div>
      <p className="mt-6 text-xs text-muted">Educational calculators only. They are not financial advice and do not guarantee any result. Check every number against your broker&apos;s specifications.</p>
    </div>
  );
}
