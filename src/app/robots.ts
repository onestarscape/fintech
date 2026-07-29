import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fintech-three-omega.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/admin",
        "/employee",
        "/agent",
        "/builder",
        "/apply",
        "/auth",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
