import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { renderProductIcon } from "@/lib/product-engine/icons";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(18,19,26,0.06)]"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-accent-soft text-accent">
          {renderProductIcon(product.icon, { className: "h-5 w-5", strokeWidth: 1.75 })}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <h3 className="font-display mt-5 text-base font-semibold">{product.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        {product.short_description}
      </p>
    </Link>
  );
}
