import { DEMO_LABEL, DEMO_MODE, ILLUSTRATIVE_LABEL } from "@/lib/config/site";

export function DemoBadge({ variant = "short" }: { variant?: "short" | "demo" | "illustrative" }) {
  if (!DEMO_MODE) return null;
  const text = variant === "short" ? "DEMO" : variant === "demo" ? DEMO_LABEL : ILLUSTRATIVE_LABEL;
  return (
    <span className="inline-flex items-center rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
      {text}
    </span>
  );
}

export function ComingSoon({ children = "Coming Soon" }: { children?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-line bg-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
      {children}
    </span>
  );
}
