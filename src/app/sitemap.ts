import type { MetadataRoute } from "next";
import { categories } from "@/data/catalog";
import { getCustomerProductSlugsSafe } from "@/lib/serverCatalog";

// Evaluated per-request on the Worker so it always reflects the live product DB
// (D1 is only bound at request time, not during the build). Product URLs now come
// from a slug-only query — no JSON parse, no base64 image work — so generation is
// cheap and can't trip the Worker's limits (Error 1102) mid-fetch, which is what
// previously surfaced intermittently as "Couldn't fetch" in Search Console.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://flashkart.co";
  const today = new Date().toISOString();
  // Only customer-visible products belong in the sitemap — hidden/deleted
  // products must not be discoverable. DB unavailable → omit product URLs.
  const slugs = await getCustomerProductSlugsSafe();
  return [
    { url: base, lastModified: today, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/where-we-supply`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/franchise`, lastModified: today, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    ...categories.map((c) => ({
      url: `${base}/shop?cat=${c.slug}`,
      lastModified: today,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...slugs.map((slug) => ({
      url: `${base}/product/${slug}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
