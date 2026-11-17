/** Instruments with a USD quote currency. Value of a 1.00 price move for 1 lot (USD account). */
export const INSTRUMENTS = {
  EURUSD: { label: "EURUSD", contractSize: 100000, decimals: 5 },
  GBPUSD: { label: "GBPUSD", contractSize: 100000, decimals: 5 },
  XAUUSD: { label: "XAUUSD (Gold)", contractSize: 100, decimals: 2 },
} as const;
export type InstrumentId = keyof typeof INSTRUMENTS;

export interface SizeInput { balance: number; riskPct: number; entry: number; stop: number; contractSize: number; }

/** lots = risk amount / (stop distance in price * contract size). Assumes the account currency is USD. */
export function positionSize({ balance, riskPct, entry, stop, contractSize }: SizeInput) {
  const dist = Math.abs(entry - stop);
  const riskAmount = (balance * riskPct) / 100;
  if (!(balance > 0) || !(riskPct > 0) || !(dist > 0) || !(contractSize > 0)) return null;
  const lots = riskAmount / (dist * contractSize);
  return { riskAmount, distance: dist, lots, lotsRounded: Math.floor(Math.round(lots * 1e6) / 1e6 * 100) / 100 };
}

export function riskReward(entry: number, stop: number, target: number) {
  const risk = Math.abs(entry - stop), reward = Math.abs(target - entry);
  if (!(risk > 0) || !(reward > 0)) return null;
  const rr = reward / risk;
  return { rr, breakEvenWinRate: 1 / (1 + rr) };
}

/** Expected result per trade in R, for a win rate (0..1) and reward:risk. */
export const expectancyR = (winRate: number, rr: number) => winRate * rr - (1 - winRate);

/** Gain needed to recover from a drawdown (both in percent). */
export const recoveryPct = (ddPct: number) => (ddPct >= 100 || ddPct <= 0 ? null : (ddPct / (100 - ddPct)) * 100);

export function tradePnl(direction: "buy" | "sell", lots: number, entry: number, exit: number, contractSize: number) {
  const move = direction === "buy" ? exit - entry : entry - exit;
  return move * lots * contractSize;
}
