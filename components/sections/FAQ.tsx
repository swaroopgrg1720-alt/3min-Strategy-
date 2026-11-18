import Link from "next/link";
import type { ReactNode } from "react";

export const faqs: { q: string; a: ReactNode; plain: string }[] = [
  { q: "What is 3MIN SCALP?", plain: "3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD.", a: "3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD." },
  { q: "Which platform does it support?", plain: "The EA is compatible with MetaTrader 5 (MT5).", a: "The EA is compatible with MetaTrader 5 (MT5)." },
  { q: "Which instruments are supported?", plain: "The EA currently supports EURUSD, GBPUSD, and XAUUSD (Gold).", a: "The EA currently supports EURUSD, GBPUSD, and XAUUSD (Gold)." },
  { q: "Does it guarantee profits?", plain: "No. The EA does not guarantee profits, as all trading involves risk and no trading system can guarantee consistent returns.", a: "No. The EA does not guarantee profits, as all trading involves risk and no trading system can guarantee consistent returns." },
  { q: "Can I test it on a demo account?", plain: "Yes. You can test the EA on a demo account before using it with real funds. Demo testing is recommended to evaluate its performance and compatibility with your broker.", a: "Yes. You can test the EA on a demo account before using it with real funds. Demo testing is recommended to evaluate its performance and compatibility with your broker." },
  { q: "Do I need a VPS?", plain: "A VPS is recommended for uninterrupted automated trading. However, whether you need one depends on your trading setup and requirements.", a: "A VPS is recommended for uninterrupted automated trading. However, whether you need one depends on your trading setup and requirements." },
  { q: "Can I use it with my broker?", plain: "Yes. The EA can be used with brokers that support MetaTrader 5. However, broker-specific conditions, such as spreads, execution speed, and trading rules, may affect its performance. Demo testing is recommended before live use.", a: "Yes. The EA can be used with brokers that support MetaTrader 5. However, broker-specific conditions, such as spreads, execution speed, and trading rules, may affect its performance. Demo testing is recommended before live use." },
  { q: "Do you offer monthly access?", plain: "Yes. Monthly access is available through a subscription.", a: "Yes. Monthly access is available through a subscription." },
  { q: "Do you offer lifetime access?", plain: "Yes. We also offer a lifetime access option, allowing you to use the EA without recurring subscription payments.", a: "Yes. We also offer a lifetime access option, allowing you to use the EA without recurring subscription payments." },
  { q: "How do I install it?", plain: "You can install the EA by following the step-by-step instructions provided in the Documentation.", a: <>You can install the EA by following the step-by-step instructions provided in the <Link href="/documentation" className="text-accent underline">Documentation</Link>.</> },
  { q: "How do I receive the EA?", plain: "Once your payment is confirmed and your license is created, you will receive access to the EA through your customer area.", a: "Once your payment is confirmed and your license is created, you will receive access to the EA through your customer area." },
  { q: "What payment methods are supported?", plain: "Currently, we accept cryptocurrency payments only.", a: "Currently, we accept cryptocurrency payments only." },
];

export function FAQ() {
  return (
    <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg2/60">
      {faqs.map((f) => (
        <details key={f.q} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {f.q}
            <span aria-hidden="true" className="text-accent transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
