import Link from "next/link";

export function CTA({ title = "Ready to get started?", text = "Choose monthly or lifetime access and pay with cryptocurrency.", label = "Get Started", href = "/pricing" }: { title?: string; text?: string; label?: string; href?: string }) {
  return (
    <section className="section">
      <div className="container-x">
        <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-forest/50 via-bg2 to-bg2 px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{text}</p>
          <Link href={href} className="btn btn-primary mt-7">{label}</Link>
          <p className="mt-4 text-xs text-muted">Trading involves risk. Test on a demo account first.</p>
        </div>
      </div>
    </section>
  );
}
