import "server-only";

/** Sends one email through Resend (https://resend.com). Silently does nothing if email is not configured. */
export async function sendEmail(opts: { to: string | string[]; subject: string; text: string; html?: string }): Promise<boolean> {
  const key = process.env.EMAIL_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (!key || !from) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text, ...(opts.html ? { html: opts.html } : {}) }),
      signal: AbortSignal.timeout(6_000),
    });
    if (!res.ok) console.error("sendEmail failed", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("sendEmail error", e);
    return false;
  }
}

export const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
