export function LogoMark({ size = 36 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-sm.png" width={size} height={size} alt="" aria-hidden="true" style={{ width: size, height: size }} />;
}

/** Full logo on desktop; compact mark + short wordmark on mobile. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={40} />
      <span className="text-[15px] font-bold tracking-[0.14em] text-ink">
        3MIN <span className="text-accent">SCALP</span>
      </span>
    </span>
  );
}
