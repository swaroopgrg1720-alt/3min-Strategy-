import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/SectionHeading";
import { changelog } from "@/lib/changelog";

export const metadata: Metadata = { title: "Changelog", alternates: { canonical: "/changelog" } };

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (<div className="mt-4"><p className="text-sm font-semibold">{title}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">{items.map((i) => (<li key={i}>{i}</li>))}</ul></div>);
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Changelog" title="Version history" />
      <section className="section"><div className="container-x max-w-3xl space-y-5">
        {changelog.map((c) => (
          <article key={c.version} className="card">
            <div className="flex items-baseline justify-between"><h2 className="text-xl font-semibold">3MIN SCALP v{c.version}</h2><span className="text-sm text-muted">{c.date}</span></div>
            <List title="Changes" items={c.changes} /><List title="Improvements" items={c.improvements} /><List title="Bug fixes" items={c.fixes} />
          </article>
        ))}
      </div></section>
    </>
  );
}
