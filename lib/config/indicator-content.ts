/**
 * Facts shown on the /indicator page. Only add what the indicator really does.
 * A section with an empty list below is hidden on the site, so nothing is ever invented.
 */
export interface Feature { title: string; text: string }

export const indicatorContent = {
  /** Example: { title: "Buy and sell signals", text: "Arrows appear on the chart when ..." } */
  features: [] as Feature[],
  /** Example: ["Gold (XAUUSD)", "EURUSD", "Nasdaq 100"] */
  markets: [] as string[],
  /** Timeframe the indicator is built for (stated by the owner). */
  primaryTimeframe: "3 minute",
  /** Example: ["Popup alerts", "Mobile notifications"] — only the alert types the script really supports. */
  alerts: [] as string[],
  /** Example: { version: "1.0", date: "2026-12-01", note: "Initial release" } */
  changelog: [] as { version: string; date: string; note: string }[],
  /** Real customer reviews only. */
  reviews: [] as { name: string; rating: number; text: string; date: string; verified: boolean }[],
};
