export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#00B77A" />
          <stop offset="1" stopColor="#00E59B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#080D12" />
      <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#123D32" strokeWidth="2" />
      <path d="M32 11 A21 21 0 0 1 53 32" fill="none" stroke="#123D32" strokeWidth="3" strokeLinecap="round" />
      <path d="M13 40 L24 30 L31 36 L40 22 L51 17" fill="none" stroke="url(#lm-g)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="51" cy="17" r="3.6" fill="#00E59B" />
    </svg>
  );
}

/** Full logo on desktop; compact mark + short wordmark on mobile. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[15px] font-bold tracking-[0.14em] text-ink">
        3MIN <span className="text-accent">SCALP</span>
      </span>
    </span>
  );
}
