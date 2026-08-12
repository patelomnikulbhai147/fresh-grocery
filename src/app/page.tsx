import { Hero } from "@/components/home/Hero";
import { HomepageProduceShowcase } from "@/components/home/HomepageProduceShowcase";
import { CategoryGridSection } from "@/components/home/CategoryGridSection";
import { InstantOrderBulkOrderCards } from "@/components/home/InstantOrderBulkOrderCards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlashKart | Fresh Vegetables & Seasonal Fruits Direct Supply",
  description:
    "FlashKart provides fresh vegetables and seasonal fruits with direct supply to hostels, PGs, hotels and shops across Gandhinagar and Gujarat.",
  alternates: { canonical: "https://flashkart.co" },
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col font-sans selection:bg-[#067a46] selection:text-white">
      
      {/* Global Watercolor Background Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-[url('/images/hero_bg_india.png')] bg-cover bg-top bg-no-repeat opacity-75" 
        aria-hidden="true"
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1">
          {/* 1. Independence Day Hero Section */}
          <Hero />

          {/* 2. Instant Order + Bulk Order Highlight Cards (Immediately After Hero) */}
          <InstantOrderBulkOrderCards />

          {/* 3. Category Section 1: Fresh Vegetables & Seasonal Fruits Quick Panels */}
          <HomepageProduceShowcase />

          {/* 4. Category Section 2: 3x3 Product Grid for Fresh Vegetables */}
          <CategoryGridSection />
        </main>
      </div>

    </div>
  );
}
