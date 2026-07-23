export function ContentPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      {eyebrow && <p className="text-sm font-medium text-accent">{eyebrow}</p>}
      <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="prose-content mt-8 space-y-5 text-sm leading-relaxed text-ink/80">
        {children}
      </div>
    </div>
  );
}
