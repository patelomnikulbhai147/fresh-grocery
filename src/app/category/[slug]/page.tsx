import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { categories } from "@/data/catalog";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";

// Product data must always be read live from the production database.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (!cat) {
    return {
      title: "Category Not Found · FlashKart",
      description: "Browse FlashKart's full produce catalog.",
    };
  }

  return {
    title: `${cat.name} · FlashKart Fresh Produce`,
    description: `Order farm-fresh ${cat.name.toLowerCase()} direct from FlashKart in Gandhinagar, Gujarat.`,
    openGraph: {
      title: `${cat.name} · FlashKart Fresh Produce`,
      description: `Order farm-fresh ${cat.name.toLowerCase()} direct from FlashKart in Gandhinagar, Gujarat.`,
      images: [cat.image],
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; deals?: string; filter?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const live = await getCustomerProductsSafe();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-purple-950">
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 md:px-8 py-10 md:py-14">
        {live.ok ? (
          <ShopClient
            products={live.products}
            categories={categories}
            initial={{ ...sp, cat: slug }}
          />
        ) : (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl px-5 py-6 text-center">
            Unable to load products. Please try again.
          </div>
        )}
      </main>
    </div>
  );
}
