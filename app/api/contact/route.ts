import { NextResponse } from "next/server";
import { clientKey, isValidEmail, rateLimit, sanitizeText } from "@/lib/security";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientKey(req)}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = sanitizeText(body.name, 100);
  const email = sanitizeText(body.email, 254);
  const subject = sanitizeText(body.subject, 150);
  const message = sanitizeText(body.message, 4000);
  const honeypot = sanitizeText(body.website, 50);

  if (honeypot) return NextResponse.json({ ok: true }); // bots
  if (!name || !subject || !message || !isValidEmail(email)) {
    return NextResponse.json({ error: "Please complete all fields with a valid email." }, { status: 400 });
  }

  // TODO: send via your email provider (EMAIL_API_KEY) or store as a support ticket.
  if (!process.env.EMAIL_API_KEY) {
    return NextResponse.json({ error: "Messaging is not configured yet." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
