/**
 * Facts shown on the /indicator page. Only add what the indicator really does.
 * A section with an empty list below is hidden on the site, so nothing is ever invented.
 */
export interface Feature { title: string; text: string }

export const indicatorContent = {
  /** Example: { title: "Buy and sell signals", text: "Arrows appear on the chart when ..." } */
  features: [
    { title: "Trend-based analysis", text: "Identify potential opportunities in the direction of the prevailing market trend." },
    { title: "Technical analysis", text: "Uses multiple technical conditions to evaluate market behavior and identify potential setups." },
    { title: "Breakout detection", text: "Designed to identify potential breakout opportunities and generate signals when the required conditions are met." },
    { title: "Buy and sell signals", text: "Clear directional signals displayed directly on the TradingView chart." },
    { title: "Entry, stop loss and take profit", text: "Every supported setup can display the key trade levels together: entry, stop loss and take profit." },
    { title: "Multi-asset support", text: "The indicator can be used across a wide range of trading instruments and asset classes." },
    { title: "Built for XAU/USD", text: "Compatible with multiple assets, but primarily designed and developed with XAU/USD (Gold) in mind." },
    { title: "TradingView ready", text: "Access your indicator directly through TradingView and analyze your preferred charts from one platform." },
  ] as Feature[],
  /** Example: ["Gold (XAUUSD)", "EURUSD", "Nasdaq 100"] */
  markets: ["XAU/USD (Gold), the main design focus"] as string[],
  /** Timeframe the indicator is built for (stated by the owner). */
  primaryTimeframe: "3 minute",
  /** Example: ["Popup alerts", "Mobile notifications"] — only the alert types the script really supports. */
  alerts: [] as string[],
  /** Example: { version: "1.0", date: "2026-12-01", note: "Initial release" } */
  changelog: [] as { version: string; date: string; note: string }[],
  /** Real customer reviews only. */
  reviews: [] as { name: string; rating: number; text: string; date: string; verified: boolean }[],
};
