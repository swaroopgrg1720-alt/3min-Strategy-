import { PageHeader } from "@/components/ui/SectionHeading";

export function LegalPage({ eyebrow = "Legal", title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} />
      <section className="section">
        <div className="container-x">
          <article className="prose-legal max-w-3xl">{children}</article>
        </div>
      </section>
    </>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-[0.9em] text-amber-300">{children}</mark>;
}
