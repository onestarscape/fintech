"use server";

import { revalidateTag, revalidatePath } from "next/cache";

/**
 * Instantly clears the cached products/partners data (see
 * src/lib/data/products.ts). Without this, a change made directly in the
 * database — like running a migration — sits behind up to a 5-minute
 * cache window before it shows up on the live site. Call this right
 * after running any migration that adds/edits/removes products or
 * partners, instead of waiting it out.
 */
export async function refreshProductCache() {
  revalidateTag("products", "max");
  revalidateTag("partners", "max");
  revalidatePath("/");
}
