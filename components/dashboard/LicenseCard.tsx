import { dmy, type LicenseView } from "@/components/dashboard/ui";
import { LogoMark } from "@/components/ui/Logo";

type Tone = "green" | "gold" | "grey";

/** Palette follows meaning: green = monthly, gold = lifetime, grey = not usable right now. */
const TONES: Record<Tone, { bg: string; edge: string; accent: string; dot: string }> = {
  green: {
    bg: "radial-gradient(120% 90% at 0% 0%, rgba(0,229,155,.22) 0%, transparent 55%), linear-gradient(135deg, #1F5A41 0%, #123024 48%, #0B1913 100%)",
    edge: "rgba(0,229,155,.28)", accent: "#00E59B", dot: "#00E59B",
  },
  gold: {
    bg: "radial-gradient(120% 90% at 0% 0%, rgba(244,197,122,.26) 0%, transparent 55%), linear-gradient(135deg, #4A3714 0%, #251B0A 48%, #120D05 100%)",
    edge: "rgba(244,197,122,.35)", accent: "#F4C57A", dot: "#F4C57A",
  },
  grey: {
    bg: "radial-gradient(120% 90% at 0% 0%, rgba(255,255,255,.08) 0%, transparent 55%), linear-gradient(135deg, #2B312E 0%, #1A1F1D 48%, #0F1311 100%)",
    edge: "rgba(255,255,255,.12)", accent: "#AEB8B0", dot: "#AEB8B0",
  },
};

const STATE_LABEL: Record<LicenseView["state"], string> = { active: "Active", expired: "Expired", suspended: "Suspended", revoked: "Revoked" };

function Chip({ accent }: { accent: string }) {
  return (
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="chipg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7D79A" /><stop offset="1" stopColor="#B98A3E" /></linearGradient>
      </defs>
      <rect x="1" y="1" width="44" height="32" rx="7" fill="url(#chipg)" />
      <g stroke="#6B4C1B" strokeOpacity=".55" strokeWidth="1">
        <path d="M1 12h14M1 22h14M31 12h14M31 22h14M15 1v32M31 1v32" />
        <rect x="15" y="9" width="16" height="16" rx="3" />
      </g>
      <circle cx="23" cy="17" r="1.5" fill={accent} fillOpacity=".0" />
    </svg>
  );
}

/** A card-style license. `size="lg"` is used on the detail page. */
export function LicenseCard({ l, size = "md", sheen = false }: { l: LicenseView; size?: "md" | "lg"; sheen?: boolean }) {
  const lifetime = l.plan === "lifetime";
  const tone: Tone = l.state !== "active" ? "grey" : lifetime ? "gold" : "green";
  const t = TONES[tone];
  const lab = "text-[10.5px] font-medium leading-none text-white/55";
  const val = "mt-1.5 truncate text-[14px] font-semibold leading-none text-white";

  return (
    <div role="img" aria-label={`${lifetime ? "Lifetime" : "Monthly"} license ${l.license_ref}, ${STATE_LABEL[l.state]}`}
      className={`relative isolate aspect-[1.586/1] w-full overflow-hidden rounded-[22px] text-white ${size === "lg" ? "max-w-[460px]" : ""}`}
      style={{ background: t.bg, boxShadow: `0 24px 40px -18px rgba(0,0,0,.7), inset 0 0 0 1px ${t.edge}, inset 0 1px 0 rgba(255,255,255,.14)` }}>
      {/* fine engraved lines + large rings, like a printed security pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.07]" style={{ backgroundImage: "repeating-linear-gradient(115deg, #fff 0 1px, transparent 1px 7px)" }} aria-hidden="true" />
      <svg className="pointer-events-none absolute -bottom-16 -right-12 -z-10 h-64 w-64 opacity-[.13]" viewBox="0 0 200 200" fill="none" stroke={t.accent} strokeWidth=".8" aria-hidden="true">
        {[90, 74, 58, 42, 26].map((r) => <circle key={r} cx="100" cy="100" r={r} />)}
      </svg>
      {sheen && <div className="card-sheen pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />}

      <div className="flex h-full flex-col justify-between p-[5.5%]">
        <div className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-2"><LogoMark size={size === "lg" ? 30 : 26} /><span className="text-[12px] font-bold tracking-[0.14em]">3MIN <span style={{ color: t.accent }}>SCALP</span></span></span>
          <span className="flex items-center gap-2">
            <span className="rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none" style={{ borderColor: t.edge, color: t.accent }}>{lifetime ? "Lifetime" : "Monthly"}</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M8 7a7 7 0 0 1 0 10M12 5a11 11 0 0 1 0 14M16 3a15 15 0 0 1 0 18" /></svg>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-3"><Chip accent={t.accent} /></div>
          <p className={`mt-3 truncate font-mono font-medium text-white ${size === "lg" ? "text-xl" : "text-[17px]"}`} style={{ letterSpacing: ".14em", textShadow: "0 1px 0 rgba(0,0,0,.55), 0 0 1px rgba(255,255,255,.25)" }}>{l.license_ref}</p>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0"><p className={lab}>MT5 account</p><p className={`${val} font-mono`}>{l.mt5_account ?? "Not set"}</p></div>
          <div className="min-w-0"><p className={lab}>{lifetime ? "Access" : "Valid until"}</p><p className={val}>{lifetime ? "Lifetime" : dmy(l.expiration_date)}</p></div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 text-[11px] font-semibold leading-none">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.dot }} aria-hidden="true" />{STATE_LABEL[l.state]}
          </div>
        </div>
      </div>
    </div>
  );
}
