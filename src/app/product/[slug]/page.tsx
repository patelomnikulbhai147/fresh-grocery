import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCustomerProductBySlugFromDb, getCustomerRelatedProductsFromDb } from "@/lib/serverCatalog";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSection } from "@/components/home/ProductSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatINR } from "@/lib/utils";
import { categories } from "@/data/catalog";

// Build a clean meta-description snippet from the real product copy: collapse
// whitespace, and when it exceeds the target length cut on a word boundary
// (never mid-word) and finish with an ellipsis. Invents nothing — it only
// trims the product's own tagline + description.
function metaSnippet(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,;:.\-–—]+$/, "") + "…";
}

// Every product view is checked live against the production database —
// a product the Super Admin has deactivated/hidden/deleted returns 404
// even on an old bookmarked URL.
export const dynamic = "force-dynamic";

// Canonical origin for absolute URLs required by structured data.
const SITE = "https://flashkart.co";
const abs = (u: string) => (u.startsWith("http") ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`);

type Params = { params: Promise<{ slug: string }> };

// Deduped per request via React cache: generateMetadata and the page body
// share ONE product lookup instead of querying the database twice.
const loadProduct = cache((slug: string) => getCustomerProductBySlugFromDb(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await loadProduct(slug).catch(() => null);
  if (!p) return { title: "Product not found" };
  return {
    // No "· FlashKart" suffix here — the root layout's title template
    // ("%s · FlashKart") appends the brand exactly once.
    title: `${p.name} — ${formatINR(p.weights[0].price)}`,
    // Word-boundary snippet of the real tagline + description (no mid-word cut).
    description: metaSnippet(`${p.tagline} ${p.description}`),
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: `${p.name} · FlashKart`,
      description: p.tagline,
      images: [p.image],
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  let product = null;
  let dbOk = true;
  try {
    product = await loadProduct(slug);
  } catch {
    dbOk = false;
  }
  if (!dbOk) {
    // Database briefly unreachable → proper error state, never a 404 and
    // never fallback/demo product data.
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl px-5 py-6 text-center">
            Unable to load this product. Please try again.
          </div>
        </main>
      </div>
    );
  }
  if (!product) notFound();

  // Keep this bounded. Loading the full catalog here parses every stored
  // product image in the Worker, which was the remaining 1102 pressure point.
  const related = await getCustomerRelatedProductsFromDb(product.category, product.id).catch(() => []);

  const productUrl = `${SITE}/product/${product.slug}`;
  // Resolve this product's real category to its canonical URL for the
  // breadcrumb. If the category doesn't map to a known one, fall back to /shop
  // rather than inventing a category URL. The visible breadcrumb in
  // <ProductDetail> resolves the same way, so both point at the same target.
  const productCat = categories.find((c) => c.slug === product.category);
  const categoryUrl = productCat ? `${SITE}/shop?cat=${productCat.slug}` : `${SITE}/shop`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    // Absolute HTTPS image URLs — Google may not resolve relative paths in JSON-LD.
    image: product.gallery.map(abs),
    description: product.description,
    brand: { "@type": "Brand", name: "FlashKart" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: product.weights[0].price,
      availability:
        (product.stockGrams ?? product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    // NOTE: no aggregateRating. The catalog's rating (hardcoded 4.8) and
    // reviewCount (randomised) are demo values with no genuine reviews behind
    // them; emitting them as AggregateRating structured data violates Google's
    // review-snippet policy. Re-add only when real review data exists.
    // No `sku`: the product data model has no real SKU/identifier — none is invented.
  };

  // Mirrors the visible breadcrumb rendered in <ProductDetail>: Home → Fresh
  // Produce (this product's category URL) → this product.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Fresh Produce", item: categoryUrl },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={schema} />
      <JsonLd data={breadcrumb} />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        <ProductDetail product={product} />

        {related.length > 0 && (
          <div className="mt-16">
            <ProductSection
              eyebrow="Related Produce"
              title={<>More from <span className="italic text-amber-600">{product.subcategory}</span>.</>}
              products={related}
            />
          </div>
        )}
      </main>
    </div>
  );
}
