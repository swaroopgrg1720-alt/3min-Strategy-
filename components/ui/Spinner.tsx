/** Small rotating ring. Uses currentColor, so it matches the text colour around it. */
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Centered loading state for page transitions. */
export function PageLoading({ label = "Loading…", fill = true }: { label?: string; fill?: boolean }) {
  return (
    <div role="status" aria-live="polite" className={`flex flex-col items-center justify-center gap-4 text-accent ${fill ? "min-h-[60vh]" : "py-16"}`}>
      <Spinner size={40} />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
