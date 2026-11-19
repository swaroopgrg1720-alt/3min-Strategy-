import { ComingSoon } from "@/components/ui/DemoBadge";
import { SocialIcon } from "@/components/ui/Icons";
import { site } from "@/lib/config/site";

const proof = ["Verified Trading Results", "Independent Verification", "Customer Reviews", "Live Trading History"];

export function SocialProof() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {proof.map((p) => (
        <div key={p} className="card text-center">
          <p className="font-semibold">{p}</p>
          <div className="mt-3"><ComingSoon /></div>
        </div>
      ))}
    </div>
  );
}

const placeholders = ["CUSTOMER REVIEW — COMING SOON", "BETA TESTER — PLACEHOLDER", "VERIFIED REVIEW — COMING SOON"];

export function Testimonials() {
  return (
    <div className="mt-10 grid gap-5 md:grid-cols-3">
      {placeholders.map((label) => (
        <figure key={label} className="card border-dashed" aria-label="Placeholder testimonial card">
          <span className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-xs font-bold tracking-wider text-amber-300">{label}</span>
          <div className="mt-5 space-y-2" aria-hidden="true">
            <div className="h-2.5 w-full rounded bg-line" /><div className="h-2.5 w-11/12 rounded bg-line" /><div className="h-2.5 w-2/3 rounded bg-line" />
          </div>
          <figcaption className="mt-5 text-xs text-muted">No reviews yet. Real, verified reviews will appear here.</figcaption>
        </figure>
      ))}
    </div>
  );
}

const future = ["EA demonstrations", "MT5 tutorials", "Educational trading content", "Product updates", "Verified performance reports", "Installation tutorials"];

export function FollowSection() {
  return (
    <div className="mt-10">
      <ul className="flex flex-wrap gap-3">
        {site.social.map((s) => (
          <li key={s.id}>
            {s.href ? (
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !py-2.5"><SocialIcon id={s.id} />{s.label}</a>
            ) : (
              <span className="btn btn-ghost !py-2.5 cursor-default opacity-70" title={s.placeholder}><SocialIcon id={s.id} />{s.label} <span className="text-xs text-muted">{s.placeholder}</span></span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-muted">Future content:</p>
      <ul className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        {future.map((f) => (<li key={f} className="rounded-full border border-line px-3 py-1">{f}</li>))}
      </ul>
    </div>
  );
}
