import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ShopClient } from "@/components/shop/ShopClient";
import { categories, products } from "@/data/catalog";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; deals?: string; filter?: string; sort?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  if (sp.cat && sp.cat !== "all") {
    const cat = categories.find((c) => c.slug.toLowerCase() === sp.cat?.toLowerCase());
    if (cat) {
      return {
        title: `${cat.name} · FlashKart Fresh Produce`,
        description: `Explore fresh ${cat.name.toLowerCase()} from FlashKart. Direct farm quality for hostels, hotels, shops, and direct buyers.`,
        openGraph: {
          title: `${cat.name} · FlashKart Fresh Produce`,
          description: `Explore fresh ${cat.name.toLowerCase()} from FlashKart. Direct farm quality for hostels, hotels, shops, and direct buyers.`,
          images: [cat.image],
        },
      };
    }
  }

  return {
    title: "Fresh Vegetables & Seasonal Fruits Catalog · FlashKart",
    description: "Browse FlashKart's produce catalog — daily farm-fresh vegetables and seasonal fruits at better rates in Gandhinagar, Gujarat.",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; q?: string; deals?: string; filter?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-[1400px] w-full px-5 md:px-8 py-10 md:py-14">
        <ShopClient
          products={products}
          categories={categories}
          initial={sp}
        />
      </main>
      <Footer />
    </div>
  );
}
