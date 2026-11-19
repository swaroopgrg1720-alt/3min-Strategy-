"use client";

import { useState } from "react";

/** Shared building blocks for the calculators and the journal. */

export const inputBase =
  "w-full rounded-2xl border border-line bg-bg px-4 text-[17px] font-medium tabular-nums placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function ToolInput({ label, value, set, unit, hint, step = "any", placeholder }: { label: string; value: string; set: (v: string) => void; unit?: string; hint?: string; step?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="relative mt-1.5 block">
        <input inputMode="decimal" type="number" step={step} value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} className={`${inputBase} h-[54px] ${unit ? "pr-16" : ""}`} />
        {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted">{unit}</span>}
      </span>
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
    </label>
  );
}

export function ChipGroup<T extends string>({ label, value, options, onChange }: { label?: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      {label && <p className="text-sm font-medium text-muted">{label}</p>}
      <div role="radiogroup" aria-label={label} className="mt-1.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
              className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold active:scale-[0.97] ${on ? "border-accent bg-accent/15 text-accent" : "border-line text-muted"}`}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label?: string; value: T; options: { value: T; label: string; tone?: "good" | "bad" }[]; onChange: (v: T) => void }) {
  return (
    <div>
      {label && <p className="text-sm font-medium text-muted">{label}</p>}
      <div role="radiogroup" aria-label={label} className="mt-1.5 grid grid-flow-col auto-cols-fr gap-1 rounded-2xl border border-line bg-bg p-1">
        {options.map((o) => {
          const on = o.value === value;
          const tone = o.tone === "bad" ? "bg-red-400 text-bg" : "bg-accent text-bg";
          return (
            <button key={o.value} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
              className={`min-h-[46px] rounded-xl text-[15px] font-semibold ${on ? tone : "text-muted"}`}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

type Tone = "good" | "bad" | "neutral";
const toneText: Record<Tone, string> = { good: "text-accent", bad: "text-red-400", neutral: "text-ink" };

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* clipboard blocked */ } }}
      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted active:bg-forest/40">
      {done ? "Copied" : "Copy"}
    </button>
  );
}

/** The big highlighted answer. */
export function HeroResult({ label, value, sub, tone = "good", copy }: { label: string; value: string; sub?: string; tone?: Tone; copy?: string }) {
  const frame = tone === "bad" ? "border-red-400/30 from-red-950/50 via-red-950/20" : tone === "neutral" ? "border-line from-bg2 via-bg2" : "border-accent/30 from-forest/70 via-forest/25";
  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br to-bg2 p-6 sm:p-7 ${frame}`} role="status" aria-live="polite">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted">{label}</p>
        {copy && value !== "—" && <CopyButton text={copy} />}
      </div>
      <p className={`mt-2 font-display text-[2.6rem] font-bold leading-none tracking-tight tabular-nums sm:text-5xl ${toneText[tone]}`}>{value}</p>
      {sub && <p className="mt-3 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function MiniStat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="rounded-2xl border border-line bg-bg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 font-display text-xl font-semibold tabular-nums ${toneText[tone]}`}>{value}</p>
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-bg2 p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
