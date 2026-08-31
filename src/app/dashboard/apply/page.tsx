import { getActiveProducts } from "@/lib/data/products";
import { ProductCard } from "@/components/shared/product-card";

export default async function DashboardApplyPage() {
  const products = await getActiveProducts();

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Start a new application
      </h1>
      <p className="mt-1 text-sm text-muted">Pick a product — the rest of the flow is guided.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {!products.length && (
          <p className="col-span-full text-sm text-muted">No products available right now.</p>
        )}
      </div>
    </div>
  );
}
