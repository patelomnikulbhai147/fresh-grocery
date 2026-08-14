"use client";
import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Truck, Tag, Package } from "lucide-react";
import { PincodeDeliveryCard } from "@/components/home/PincodeDeliveryCard";

const benefits = [
  {
    icon: Leaf,
    title: "Farm Fresh",
    desc: "Directly sourced from trusted farmers",
  },
  {
    icon: ShieldCheck,
    title: "Premium Quality",
    desc: "Carefully selected for the best quality",
  },
  {
    icon: Truck,
    title: "Timely Supply",
    desc: "Reliable and on-time delivery",
  },
  {
    icon: Tag,
    title: "Best Prices",
    desc: "Competitive pricing for your business",
  },
  {
    icon: Package,
    title: "Bulk Orders",
    desc: "Custom orders for all business needs",
  },
];

export function Hero() {
  return (
    <div className="relative w-full">
      {/* 1. Full-Width Hero Background Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#fff3e0] via-[#fdfaf7] to-[#e8f5e9] rounded-b-[36px] md:rounded-b-[52px] shadow-sm pb-16 sm:pb-20 pt-6 sm:pt-8 lg:pt-10 lg:pb-24 border-b border-white/60">
        
        {/* Watercolor Decor Spots */}
        <div 
          className="absolute -top-24 -left-24 w-[32rem] h-[32rem] bg-[#ff9933]/15 rounded-full blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />
        <div 
          className="absolute -bottom-24 -right-24 w-[32rem] h-[32rem] bg-[#138808]/12 rounded-full blur-3xl pointer-events-none z-0" 
          aria-hidden="true" 
        />
        
        {/* Soft Wave Decor */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none leading-none z-0 rotate-180">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-20 fill-white opacity-70">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>

        {/* Content Container (100% Full Width across screen) */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
          
          {/* Top Full-Width Pincode Checker Card */}
          <PincodeDeliveryCard />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 xl:col-span-6 2xl:col-span-6 flex flex-col items-start gap-4 lg:gap-6 text-left">
              
              {/* Main Headline */}
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] xl:text-[4.25rem] 2xl:text-[4.75rem] leading-[1.08] font-extrabold text-[#14281d]">
                Celebrate <span className="text-[#ea580c] relative inline-block">15 August</span><br />
                with Freshness
              </h1>
              
              {/* Subtitle */}
              <p className="text-slate-600 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl font-medium leading-relaxed mt-1">
                Fresh vegetables and seasonal fruits, supplied directly to Hostels, PGs, Hotels and Shops.
              </p>
              
              {/* Primary CTA */}
              <div className="pt-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-9 py-4 sm:py-4.5 rounded-full text-base sm:text-lg transition duration-200 shadow-lg shadow-[#067a46]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Enquire Now</span>
                  <span className="text-xl">→</span>
                </Link>
              </div>
            </div>

            {/* Right Content Column (Basket + Indian Badge) */}
            <div className="lg:col-span-6 xl:col-span-6 2xl:col-span-6 relative flex flex-col items-center lg:items-end justify-center w-full min-h-0 sm:min-h-[400px] lg:min-h-[460px] xl:min-h-[500px] pt-4 lg:pt-0">
              
              {/* Indian Badge (Positioned safely at top right, fully visible) */}
              <div className="relative lg:absolute lg:top-0 lg:right-0 z-20 bg-white/95 backdrop-blur-md shadow-xl shadow-slate-200/60 rounded-2xl p-4 sm:p-5 border border-slate-100 flex flex-col items-center gap-1 min-w-[165px] sm:min-w-[180px] mb-4 lg:mb-0 transform transition duration-300 hover:scale-[1.02]">
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">— PROUD TO BE —</div>
                <div className="text-lg sm:text-xl font-black text-[#ea580c] tracking-wider leading-none">INDIAN</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-[#067a46] text-center max-w-[135px] leading-tight mt-0.5">
                  PROUD TO SERVE FRESHNESS
                </div>
                {/* Ashoka Chakra */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 mt-1.5 rounded-full border-[2px] border-[#000080] flex items-center justify-center relative bg-white shrink-0">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-[1.5px] border-[#000080] rounded-full flex items-center justify-center relative">
                    <span className="block w-[1.5px] h-full bg-[#000080] absolute"></span>
                    <span className="block w-full h-[1.5px] bg-[#000080] absolute"></span>
                    <span className="block w-[1.5px] h-full bg-[#000080] absolute rotate-45"></span>
                    <span className="block w-[1.5px] h-full bg-[#000080] absolute -rotate-45"></span>
                  </div>
                </div>
              </div>

              {/* Large, Crisp Fresh Vegetable Basket Image */}
              <div className="relative w-full max-w-[620px] lg:max-w-[720px] xl:max-w-[800px] 2xl:max-w-[860px] aspect-[4/3] z-10 flex items-center justify-center lg:justify-end">
                <Image
                  src="/images/hero_produce_basket.png"
                  alt="Fresh Vegetables & Fruits Basket"
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-[1.01] transition-transform duration-300"
                  priority
                  unoptimized
                />
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
