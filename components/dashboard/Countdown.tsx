"use client";
import { useEffect, useState } from "react";

/** Live countdown to the expiry moment, ticking every second. */
export function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = now === null ? null : Date.parse(to) - now;
  const expired = diff !== null && diff <= 0;
  const abs = diff === null ? 0 : Math.abs(diff);
  const parts: [string, number][] = [
    ["Days", Math.floor(abs / 86_400_000)], ["Hours", Math.floor(abs / 3_600_000) % 24],
    ["Minutes", Math.floor(abs / 60_000) % 60], ["Seconds", Math.floor(abs / 1000) % 60],
  ];
  const tone = expired ? "text-red-300" : diff !== null && diff < 7 * 86_400_000 ? "text-amber-300" : "text-ink";
  return (
    <div>
      <p className="mb-2 text-sm text-muted">{expired ? "Expired" : "Expires in"}</p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label={expired ? "License expired" : "Time until license expires"}>
        {parts.map(([label, v]) => (
          <div key={label} className="rounded-2xl border border-line bg-bg px-2 py-3 text-center">
            <p className={`font-display text-2xl font-bold tabular-nums sm:text-3xl ${tone}`}>{diff === null ? "--" : String(v).padStart(2, "0")}</p>
            <p className="mt-0.5 text-[11px] text-muted sm:text-xs">{label}</p>
          </div>
        ))}
      </div>
      {expired && <p className="mt-2 text-xs text-red-300">This license ended {parts[0][1]} day{parts[0][1] === 1 ? "" : "s"} ago. Renew to continue using the EA.</p>}
    </div>
  );
}
