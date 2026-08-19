import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getCustomerProductBySlugFromDb, getCustomerRelatedProductsFromDb } from "@/lib/serverCatalog";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductSection } from "@/components/home/ProductSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatINR } from "@/lib/utils";

// Every product view is checked live against the production database —
// a product the Super Admin has deactivated/hidden/deleted returns 404
// even on an old bookmarked URL.
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

// Deduped per request via React cache: generateMetadata and the page body
// share ONE product lookup instead of querying the database twice.
const loadProduct = cache((slug: string) => getCustomerProductBySlugFromDb(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await loadProduct(slug).catch(() => null);
  if (!p) return { title: "Product not found · FlashKart" };
  return {
    title: `${p.name} — ${formatINR(p.weights[0].price)} · FlashKart`,
    description: p.tagline + " " + p.description.slice(0, 120),
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.gallery,
    description: product.description,
    brand: { "@type": "Brand", name: "FlashKart" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.weights[0].price,
      availability:
        (product.stockGrams ?? product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={schema} />
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
