import Link from "next/link";
import { ProductCard } from "@/components/shared/product-card";
import { Timeline } from "@/components/shared/timeline";
import { ProductFlowchart } from "@/components/shared/product-flowchart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getActiveProducts, getActivePartners } from "@/lib/data/products";

const JOURNEY = [
  { label: "Apply", state: "done" as const },
  { label: "Documents", state: "done" as const },
  { label: "Review", state: "current" as const },
  { label: "Approved", state: "upcoming" as const },
  { label: "Disbursed", state: "upcoming" as const },
];

export default async function HomePage() {
  const [products, partners] = await Promise.all([getActiveProducts(), getActivePartners()]);

  return (
    <>
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-accent">
              Loans · Insurance · Bank Accounts
            </p>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              One application.
              <br />
              Every partner bank.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Apply once, track everything in one dashboard, and skip the branch
              visits. We route your application to the right bank, NBFC, or
              insurer — and keep you posted at every stage.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="#products" className={cn(buttonVariants({ variant: "accent", size: "lg" }))}>
                Explore products
              </Link>
              <Link href="/signup" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Create account
              </Link>
            </div>
          </div>

          {/* Signature element: the application journey, previewed live */}
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-8">
            <p className="text-sm font-medium text-muted">Your application journey</p>
            <div className="mt-6">
              <Timeline steps={JOURNEY} orientation="horizontal" />
            </div>
            <p className="mt-8 font-mono-data text-xs text-muted">
              Every product follows this same, transparent path — no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* EVERYTHING WE COVER — full product taxonomy, pulled live from the DB */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            One platform, every financial product
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            Everything routes through the same guided application engine —
            whichever product you need.
          </p>
        </div>
        <div className="mt-10">
          <ProductFlowchart products={products} />
        </div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Start an application
            </h2>
            <p className="mt-2 text-sm text-muted">
              Pick a product — the rest of the flow is guided.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {!products?.length && (
            <p className="col-span-full text-sm text-muted">
              No products configured yet — add rows to the `products` table
              (see the seed migration) to populate this grid.
            </p>
          )}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-center text-lg font-semibold tracking-tight text-muted">
          Trusted Banking &amp; Financial Partners
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners?.map((partner) => (
            <span
              key={partner.id}
              className="font-display text-sm font-medium text-ink/50 grayscale transition hover:text-ink hover:grayscale-0"
            >
              {partner.name}
            </span>
          ))}
          {!partners?.length && (
            <p className="text-sm text-muted">
              Add rows to the `partners` table to populate this section.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
