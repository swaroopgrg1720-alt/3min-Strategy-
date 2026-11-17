import Link from "next/link";
import type { ReactNode } from "react";

export const faqs: { q: string; a: ReactNode; plain: string }[] = [
  { q: "What is 3MIN SCALP?", plain: "3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD.", a: "3MIN SCALP is a MetaTrader 5 Expert Advisor designed for automated trading across EURUSD, GBPUSD and XAUUSD." },
  { q: "Which platform does it support?", plain: "MetaTrader 5.", a: "MetaTrader 5." },
  { q: "Which instruments are supported?", plain: "EURUSD, GBPUSD and XAUUSD.", a: "EURUSD, GBPUSD and XAUUSD." },
  { q: "Does it guarantee profits?", plain: "No. No trading system can guarantee profits.", a: "No. No trading system can guarantee profits." },
  { q: "Can I test it on demo?", plain: "Yes. Demo testing is recommended before using real funds.", a: "Yes. Demo testing is recommended before using real funds." },
  { q: "Do I need a VPS?", plain: "VPS usage can be useful for continuous automated operation, but requirements depend on the user's setup.", a: "VPS usage can be useful for continuous automated operation, but requirements depend on the user's setup." },
  { q: "Can I use it with my broker?", plain: "Broker conditions may affect EA execution. Demo testing is recommended.", a: "Broker conditions may affect EA execution. Demo testing is recommended." },
  { q: "Do you offer monthly access?", plain: "Yes.", a: "Yes." },
  { q: "Do you offer lifetime access?", plain: "Yes.", a: "Yes." },
  { q: "How do I install it?", plain: "See the documentation.", a: <>Follow the step-by-step guide in the <Link href="/documentation" className="text-accent underline">Documentation</Link>.</> },
  { q: "How do I receive the EA?", plain: "After confirmed payment and license creation, the customer receives access through the customer area.", a: "After confirmed payment and license creation, the customer receives access through the customer area." },
  { q: "What payment methods are supported?", plain: "Cryptocurrency only.", a: "Cryptocurrency only." },
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
