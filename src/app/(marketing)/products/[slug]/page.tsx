import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data/products";
import { renderProductIcon } from "@/lib/product-engine/icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RequiredDocumentDef } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} — Finlyst`,
    description: product.short_description ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const docs = (product.required_documents ?? []) as RequiredDocumentDef[];
  const stages = (product.workflow_stages ?? []) as string[];

  const docSections = new Map<string, RequiredDocumentDef[]>();
  for (const doc of docs) {
    const key = doc.section || "Documents";
    if (!docSections.has(key)) docSections.set(key, []);
    docSections.get(key)!.push(doc);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
        {renderProductIcon(product.icon, { className: "h-6 w-6", strokeWidth: 1.75 })}
      </span>
      <h1 className="font-display mt-5 text-3xl font-semibold tracking-tight">
        {product.name}
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
        {product.short_description}
      </p>

      <Link
        href={`/apply/${product.slug}`}
        className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-8")}
      >
        Start application
      </Link>
      <p className="mt-2 text-xs text-muted">
        You&apos;ll need to log in or create a free account to apply.
      </p>

      <div className="mt-14 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">You&apos;ll need</h2>
          <div className="mt-3 space-y-4">
            {Array.from(docSections.entries()).map(([section, sectionDocs]) => (
              <div key={section}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {section}
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {sectionDocs.map((doc) => (
                    <li key={doc.key} className="text-sm text-muted">
                      • {doc.label}
                      {!doc.required && " (optional)"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">
            Documents are stored encrypted and deleted permanently if you
            delete your account.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink">How it works</h2>
          <ol className="mt-3 space-y-2">
            {stages.map((stage, i) => (
              <li key={stage} className="text-sm text-muted">
                {i + 1}. {stage}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
