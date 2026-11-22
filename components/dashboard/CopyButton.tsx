"use client";
import { useState } from "react";

export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className={className} onClick={async () => {
      try { await navigator.clipboard.writeText(value); setDone(true); window.setTimeout(() => setDone(false), 1800); } catch { /* clipboard blocked */ }
    }}>{done ? "Copied" : label}</button>
  );
}
