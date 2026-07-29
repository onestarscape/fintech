import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/data/products";

// Falls back to the current Vercel URL; set NEXT_PUBLIC_SITE_URL once a
// custom domain is live so this (and robots.txt) update with no code change.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fintech-three-omega.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/faqs",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  const productPages = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
  }));

  return [...staticPages, ...productPages];
}
