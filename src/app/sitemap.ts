import type { MetadataRoute } from "next";
import { categories } from "@/data/catalog";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://flashkart.co";
  const today = new Date().toISOString();
  // Only customer-visible products belong in the sitemap — hidden/deleted
  // products must not be discoverable. DB unavailable → omit product URLs.
  const live = await getCustomerProductsSafe();
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
    ...live.products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: today,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
  ];
}
