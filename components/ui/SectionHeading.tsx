export function SectionHeading({
  eyebrow,
  title,
  text,
  as: Tag = "h2",
  center = false,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  as?: "h1" | "h2";
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} data-reveal>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</Tag>
      {text && <p className="mt-4 leading-relaxed text-muted">{text}</p>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <header className="border-b border-line bg-gradient-to-b from-forest/20 to-transparent">
      <div className="container-x py-16 sm:py-24">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} text={text} />
      </div>
    </header>
  );
}
