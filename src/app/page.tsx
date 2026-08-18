import { Hero } from "@/components/home/Hero";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { BestSellers, DealsOfTheDay } from "@/components/home/BestSellers";
import { WhyFlashKart, BusinessCta, PromoBanners } from "@/components/home/WhyFlashKartCta";
import { getCustomerProductsSafe } from "@/lib/serverCatalog";
import type { Metadata } from "next";

// Homepage product sections read live from the production database.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FlashKart | Two Ways to Shop. One Trusted Partner.",
  description:
    "FlashKart NOW delivers fresh vegetables, fruits and daily essentials to your doorstep. FlashKart BUSINESS supplies bulk groceries to hotels, restaurants, hostels, PGs and shops. Currently serving Gandhinagar.",
  alternates: { canonical: "https://flashkart.co" },
};

export default async function HomePage() {
  const live = await getCustomerProductsSafe();
  const products = live.ok ? live.products : null;
  return (
    <div className="relative min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans selection:bg-[#067a46] selection:text-white">
      <main className="flex-1">
        {/* 1. Hero: Two Ways to Shop + NOW/BUSINESS cards + trust strip + pincode check */}
        <Hero />

        {/* 2. Shop by Categories (Instant Delivery) */}
        <CategoryShowcase />

        {/* 3. Deals of the Day (real configured discounts, countdown to midnight) */}
        <DealsOfTheDay products={products} />

        {/* 4. Best Selling Products (live admin-managed catalog) */}
        <BestSellers products={products} />

        {/* 5. Promo banners (real FRESH20 coupon + business value) */}
        <PromoBanners />

        {/* 6. Why FlashKart trust section */}
        <WhyFlashKart />

        {/* 7. Business CTA strip */}
        <BusinessCta />
      </main>
    </div>
  );
}
