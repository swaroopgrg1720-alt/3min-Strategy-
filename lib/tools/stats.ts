export interface Trade {
  id: string;
  opened_at: string;
  symbol: string;
  direction: "buy" | "sell";
  lots: number | null;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  pnl: number;
  risk_amount: number | null;
  setup: string | null;
  notes: string | null;
}

export interface Stats {
  count: number;
  wins: number;
  losses: number;
  winRate: number | null;       // wins / (wins + losses), 0..1
  net: number;
  grossProfit: number;
  grossLoss: number;            // positive number
  profitFactor: number | null;  // null when there are no losses
  avgWin: number | null;
  avgLoss: number | null;       // positive number
  expectancy: number | null;    // average result per trade
  avgR: number | null;          // average R over trades that have a risk amount
  maxDrawdown: number;          // largest peak-to-trough fall of cumulative P&L (account currency)
  best: number | null;
  worst: number | null;
  maxLossStreak: number;
  curve: { t: string; equity: number }[];
}

export function computeStats(trades: Trade[]): Stats {
  const sorted = [...trades].sort((a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime());
  let wins = 0, losses = 0, gp = 0, gl = 0, cum = 0, peak = 0, maxDd = 0, streak = 0, maxStreak = 0;
  let rSum = 0, rN = 0;
  const curve: Stats["curve"] = [];
  for (const t of sorted) {
    const p = Number(t.pnl);
    cum += p;
    if (p > 0) { wins++; gp += p; streak = 0; }
    else if (p < 0) { losses++; gl += -p; streak++; maxStreak = Math.max(maxStreak, streak); }
    else streak = 0;
    peak = Math.max(peak, cum);
    maxDd = Math.max(maxDd, peak - cum);
    if (t.risk_amount && Number(t.risk_amount) > 0) { rSum += p / Number(t.risk_amount); rN++; }
    curve.push({ t: t.opened_at, equity: Math.round(cum * 100) / 100 });
  }
  const n = sorted.length;
  const decided = wins + losses;
  const pnls = sorted.map((t) => Number(t.pnl));
  return {
    count: n, wins, losses,
    winRate: decided ? wins / decided : null,
    net: Math.round(cum * 100) / 100,
    grossProfit: gp, grossLoss: gl,
    profitFactor: gl > 0 ? gp / gl : null,
    avgWin: wins ? gp / wins : null,
    avgLoss: losses ? gl / losses : null,
    expectancy: n ? cum / n : null,
    avgR: rN ? rSum / rN : null,
    maxDrawdown: Math.round(maxDd * 100) / 100,
    best: n ? Math.max(...pnls) : null,
    worst: n ? Math.min(...pnls) : null,
    maxLossStreak: maxStreak,
    curve,
  };
}

export function bySymbol(trades: Trade[]) {
  const m = new Map<string, { symbol: string; count: number; net: number; wins: number }>();
  for (const t of trades) {
    const r = m.get(t.symbol) ?? { symbol: t.symbol, count: 0, net: 0, wins: 0 };
    r.count++; r.net += Number(t.pnl); if (Number(t.pnl) > 0) r.wins++;
    m.set(t.symbol, r);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

export function toCsv(trades: Trade[]): string {
  const cols: (keyof Trade)[] = ["opened_at", "symbol", "direction", "lots", "entry_price", "exit_price", "stop_loss", "take_profit", "pnl", "risk_amount", "setup", "notes"];
  const esc = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = "'" + s; // neutralise spreadsheet formulas
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...trades.map((t) => cols.map((c) => esc(t[c])).join(","))].join("\n");
}
