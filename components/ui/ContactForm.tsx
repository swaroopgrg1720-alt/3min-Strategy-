"use client";
import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("sent");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  const field = "mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-accent/60";

  return (
    <form onSubmit={onSubmit} className="card space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Name
          <input name="name" required maxLength={100} autoComplete="name" className={field} />
        </label>
        <label className="text-sm font-medium">Email
          <input name="email" type="email" required maxLength={254} autoComplete="email" className={field} />
        </label>
      </div>
      <label className="block text-sm font-medium">Subject
        <input name="subject" required maxLength={150} className={field} />
      </label>
      <label className="block text-sm font-medium">Message
        <textarea name="message" required maxLength={4000} rows={6} className={field} />
      </label>
      {/* Honeypot: hidden from people, filled by bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-wrap items-center gap-4">
        <button className="btn btn-primary disabled:opacity-60" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send Message"}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state === "sent" && <span className="text-accent">Message sent. We will reply by email.</span>}
          {state === "error" && <span className="text-red-400">{error}</span>}
        </p>
      </div>
    </form>
  );
}
