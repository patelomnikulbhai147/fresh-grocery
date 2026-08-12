import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { HomepageProduceShowcase } from "@/components/home/HomepageProduceShowcase";
import { WhereWeSupplySection } from "@/components/home/WhereWeSupplySection";
import { FranchiseSection } from "@/components/home/FranchiseSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FlashKart | Fresh Vegetables & Seasonal Fruits Direct Supply",
  description:
    "FlashKart provides fresh vegetables and seasonal fruits with direct supply to hostels, PGs, hotels and shops across Gandhinagar and Gujarat.",
  alternates: { canonical: "https://flashkart.co" },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        {/* 1. Independence Day Hero Section + Benefit Strip */}
        <Hero />

        {/* 2. Side-by-Side Vegetables & Seasonal Fruits Showcase */}
        <HomepageProduceShowcase />

        {/* 3. Where We Supply Section (Hostels, Hotels, Shops) */}
        <WhereWeSupplySection />

        {/* 4. FlashKart Shop Franchise Banner */}
        <FranchiseSection />
      </main>
      <Footer />
    </div>
  );
}
