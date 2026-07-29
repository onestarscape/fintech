import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Products and partners are admin-managed and change rarely — caching
// them for a few minutes cuts a DB round trip from every single page
// view (homepage, every product page, every apply-flow load) without
// customers ever noticing stale data in practice. Tagged so a future
// admin "edit product" feature can call revalidateTag("products")
// immediately instead of waiting out the window.

export const getActiveProducts = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["active-products"],
  { revalidate: 300, tags: ["products"] }
);

export const getActivePartners = unstable_cache(
  async () => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("partners")
      .select("*")
      .eq("is_active", true)
      .order("display_order");
    return data ?? [];
  },
  ["active-partners"],
  { revalidate: 300, tags: ["partners"] }
);

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data ?? null;
  },
  ["product-by-slug"],
  { revalidate: 300, tags: ["products"] }
);
