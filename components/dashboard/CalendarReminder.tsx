"use client";

/** Downloads a calendar file (.ics) with a reminder 3 days before the license expires. */
export function CalendarReminder({ expires, refId, className, children }: { expires: string; refId: string; className?: string; children: React.ReactNode }) {
  function make() {
    const when = new Date(Date.parse(expires) - 3 * 86_400_000);
    const ymd = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
    const next = new Date(when.getTime() + 86_400_000);
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//3MIN SCALP//License//EN", "BEGIN:VEVENT",
      `UID:${refId}@3min-scalp`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(when)}`, `DTEND;VALUE=DATE:${ymd(next)}`,
      "SUMMARY:3MIN SCALP license expires in 3 days", `DESCRIPTION:Renew from your dashboard: ${window.location.origin}/dashboard/renew`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = "3min-scalp-renewal-reminder.ics";
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button type="button" className={className} onClick={make}>{children}</button>;
}
