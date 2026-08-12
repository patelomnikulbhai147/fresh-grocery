import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { IndependenceDayBanner } from "@/components/home/IndependenceDayBanner";
import { BrandMarquee } from "@/components/home/BrandMarquee";
import { WhereWeSupplySection } from "@/components/home/WhereWeSupplySection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductSection } from "@/components/home/ProductSection";
import { DealsCountdown } from "@/components/home/DealsCountdown";
import { FranchiseSection } from "@/components/home/FranchiseSection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Reviews } from "@/components/home/Reviews";
import { PincodeChecker } from "@/components/home/PincodeChecker";
import { MobileApp } from "@/components/home/MobileApp";
import {
  bestSellers,
  vegetableProducts,
  fruitProducts,
} from "@/data/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlashKart | Fresh Vegetables & Seasonal Fruits",
  description:
    "FlashKart provides fresh vegetables and seasonal fruits with a focus on quality, fair pricing and reliable supply for hostels, PGs, hotels and shops.",
  alternates: { canonical: "https://flashkart.co" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-purple-950 flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Independence Day Banner */}
        <IndependenceDayBanner />

        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Tagline Marquee */}
        <BrandMarquee />

        {/* 3. Currently Serving / Where We Supply + Direct Purchase */}
        <WhereWeSupplySection />

        {/* 4. Product Categories (Vegetables & Seasonal Fruits) */}
        <CategoryGrid />

        {/* 5. Fresh Vegetables Showcase */}
        <ProductSection
          eyebrow="Fresh Vegetables"
          title={<>Farm-Fresh Produce at <span className="italic text-purple-700">Better Rates</span>.</>}
          description="Hand-graded daily vegetables sourced from partner farms for our hostels, kitchens, and local store network."
          products={vegetableProducts.slice(0, 8)}
          cta={{ label: "View All Vegetables", href: "/shop?cat=vegetables" }}
        />

        {/* 6. Daily Specials & WhatsApp Community */}
        <DealsCountdown />

        {/* 7. Seasonal Fruits Section */}
        <ProductSection
          eyebrow="Seasonal Fruits"
          title={<>Naturally Ripened <span className="italic text-amber-600">Seasonal Fruits</span>.</>}
          description="Fresh seasonal fruits available according to current season and farm availability."
          products={fruitProducts.slice(0, 4)}
          cta={{ label: "View All Fruits", href: "/shop?cat=fruits" }}
          columns={4}
        />

        {/* 8. Franchise Program */}
        <FranchiseSection />

        {/* 9. Why FlashKart? 5 Pillars */}
        <WhyChooseUs />

        {/* 10. Reviews & Testimonials */}
        <Reviews />

        {/* 11. Gandhinagar Supply Hub Checker */}
        <PincodeChecker />

        {/* 12. Digital Mobile Experience */}
        <MobileApp />
      </main>
      <Footer />
    </div>
  );
}
