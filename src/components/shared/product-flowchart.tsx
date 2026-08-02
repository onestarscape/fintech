"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Database } from "@/types/database";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORY_LABELS: Record<string, string> = {
  Loan: "Loans",
  Insurance: "Insurance",
  Account: "Bank Accounts",
};
const CATEGORY_ORDER = ["Loan", "Insurance", "Account"];

// ---- Layout math -----------------------------------------------------------
// Deterministic tree layout: each category's vertical position is the
// center of its own products; the root sits at the center of everything.
// No layout library needed for a tree this shallow — just arithmetic.

const ROW_H = 42;
const ROOT_X = 40;
const CATEGORY_X = 300;
const PRODUCT_X = 560;
const NODE_PAD_TOP = 24;

function buildLayout(products: Product[]) {
  const grouped = CATEGORY_ORDER.map((cat) => ({
    label: CATEGORY_LABELS[cat] ?? cat,
    items: products
      .filter((p) => p.category === cat)
      .sort((a, b) => a.display_order - b.display_order),
  })).filter((g) => g.items.length > 0);

  let y = NODE_PAD_TOP;
  const categories = grouped.map((cat) => {
    const startY = y;
    const productNodes = cat.items.map((p) => {
      const py = y;
      y += ROW_H;
      return { slug: p.slug, label: p.name, y: py };
    });
    const endY = y - ROW_H;
    const categoryY = (startY + endY) / 2;
    return { label: cat.label, y: categoryY, products: productNodes };
  });
  const totalHeight = y + NODE_PAD_TOP - ROW_H + 24;
  const rootY = categories.length
    ? (categories[0].y + categories[categories.length - 1].y) / 2
    : NODE_PAD_TOP;
  return { categories, totalHeight, rootY };
}

function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const midX = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

export function ProductFlowchart({ products }: { products: Product[] }) {
  const { categories, totalHeight, rootY } = buildLayout(products);
  const width = PRODUCT_X + 220;

  if (!categories.length) return null;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${totalHeight}`}
        width={width}
        height={totalHeight}
        className="mx-auto min-w-[720px]"
        fill="none"
      >
        {/* Root -> Category connectors */}
        {categories.map((cat, i) => (
          <motion.path
            key={`root-${cat.label}`}
            d={bezierPath(ROOT_X + 66, rootY, CATEGORY_X - 8, cat.y)}
            stroke="var(--line)"
            strokeWidth={1.5}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          />
        ))}

        {/* Category -> Product connectors */}
        {categories.map((cat) =>
          cat.products.map((p, i) => (
            <motion.path
              key={`${cat.label}-${p.slug}`}
              d={bezierPath(CATEGORY_X + 96, cat.y, PRODUCT_X - 8, p.y)}
              stroke="var(--line)"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
            />
          ))
        )}

        {/* Root node */}
        <foreignObject x={ROOT_X - 40} y={rootY - 22} width={148} height={44}>
          <div className="flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-ink px-4 text-sm font-semibold text-paper font-display">
            Fast Up Loans
          </div>
        </foreignObject>

        {/* Category nodes */}
        {categories.map((cat) => (
          <foreignObject key={cat.label} x={CATEGORY_X - 8} y={cat.y - 20} width={200} height={40}>
            <div className="flex h-10 items-center justify-center rounded-[var(--radius-sm)] border border-accent/30 bg-accent-soft px-4 text-sm font-medium text-accent">
              {cat.label}
            </div>
          </foreignObject>
        ))}

        {/* Product leaf nodes — every one here is a real, live product */}
        {categories.map((cat) =>
          cat.products.map((p) => (
            <foreignObject key={p.slug} x={PRODUCT_X - 8} y={p.y - 16} width={216} height={32}>
              <Link
                href={`/products/${p.slug}`}
                className="flex h-8 items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                {p.label}
              </Link>
            </foreignObject>
          ))
        )}
      </svg>
    </div>
  );
}
