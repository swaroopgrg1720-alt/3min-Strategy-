import "server-only";

/** Fixed, human-written answers. No AI: the visitor only ever gets text you approved. Edit freely. */
const MORE = "\n\nStill need help? Reply here and our team will take over.";

const RULES: { match: RegExp; answer: string }[] = [
  { match: /\b(human|real person|agent|representative|talk to (someone|a person)|speak to)\b/i,
    answer: "Of course. A team member will reply here as soon as possible. You can add details while you wait." },
  { match: /\b(refund|money back|chargeback|cancel(l)?ation)\b/i,
    answer: "Our refund terms are on the Refund Policy page (/refund-policy). Please read them before purchasing. If you have a problem with an order, tell us your order email and we will look into it." },
  { match: /\b(renew|renewal|extend|expire[sd]?|expiry|expiration)\b/i,
    answer: "To renew, sign in and open Dashboard, then Renew, and choose the license. Renewing extends the same license and does not create a new one. After renewing, copy the updated license key from your dashboard because the key changes with the new expiry date." + MORE },
  { match: /\b(license|licence|key|activate|activation|invalid|login number|mt5 account|account number|change account)\b/i,
    answer: "Your license key is in Dashboard, then License, after your payment is confirmed. The key is tied to the first MT5 account you use it on. To move it to a different MT5 account, send us your order email and the new account number and we will unbind the old one." + MORE },
  { match: /\b(download|install|installation|setup|set up|ex5|file|where is the ea)\b/i,
    answer: "After purchase, sign in and open Dashboard to download the current EA version. Copy the file into MetaTrader 5 (File, Open Data Folder, MQL5, Experts), restart MT5, then attach the EA to a chart and paste your license key." + MORE },
  { match: /\b(pay|paid|payment|crypto|usdt|btc|bitcoin|wallet|checkout|order|transaction|not received|did not get)\b/i,
    answer: "We accept crypto only, through a secure CryptoPayr checkout. Your license is issued automatically once the payment is confirmed on the network, which can take a few minutes. If you have paid and see no license, send us your order email and the transaction ID and we will check it right away." + MORE },
  { match: /\b(price|pricing|cost|how much|plan|plans|monthly|lifetime|\$)\b/i,
    answer: "The MT5 EA is $50 per month (you can buy 1 to 12 months at once) or $250 lifetime. The TradingView indicator is $35 per month or $200 lifetime. Prices are in USD and paid in crypto. See both on the Pricing page." + MORE },
  { match: /\b(profit|guarantee|guaranteed|win ?rate|returns?|results?|risk|safe|scam|legit)\b/i,
    answer: "Trading carries a high level of risk and past performance does not guarantee future results. Please read our Risk Disclosure page (/risk-disclosure) before buying. We cannot promise profits or give financial advice." + MORE },
  { match: /^(hi|hello|hey|hii+|good (morning|afternoon|evening)|yo)\b[\s!.?]*$/i,
    answer: "Hello! Ask your question here and we will help. You can also ask about pricing, payments, licenses or setup." },
];

export const ACK = "Thanks for your message. We have received it and a team member will reply here as soon as possible. You can add more details while you wait.";

export function faqAnswer(text: string): string | null {
  const t = text.trim();
  for (const r of RULES) if (r.match.test(t)) return r.answer;
  return null;
}
