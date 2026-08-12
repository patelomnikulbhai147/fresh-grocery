"use client";
import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Truck, Tag, Package } from "lucide-react";

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
    <div className="relative">
      {/* Option 12 Code-based Hero Section */}
      <section className="relative overflow-hidden w-full bg-gradient-to-br from-[#fff2e8] via-[#f8fcf5] to-[#e8f6ed] rounded-b-[40px] shadow-sm pb-16 pt-12 lg:pt-20 lg:pb-28">
        {/* Soft Wave Decor */}
        <div className="absolute inset-x-0 bottom-0 overflow-hidden pointer-events-none leading-none z-0 rotate-180">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="opacity-30"></path>
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 md:px-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-4">
            <div className="flex items-center gap-2 text-[#067a46] font-bold text-sm tracking-widest uppercase">
              <span className="w-8 h-[1px] bg-[#067a46]"></span>
              Happy Independence Day
              <span className="w-8 h-[1px] bg-[#067a46]"></span>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-[4rem] leading-[1.1] font-extrabold text-[#1a2e24]">
              Celebrate <span className="text-[#ea580c]">15 August</span><br />
              with Freshness
            </h1>
            
            <p className="text-slate-600 text-base md:text-lg max-w-md font-medium mt-2">
              Fresh vegetables and seasonal fruits, supplied directly to Hostels, PGs, Hotels and Shops.
            </p>
            
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 bg-[#067a46] hover:bg-[#046338] text-white font-extrabold px-8 py-3.5 rounded-full text-base transition shadow-md shadow-[#067a46]/20"
            >
              Enquire Now <span className="ml-1 text-lg">→</span>
            </Link>
          </div>

          {/* Right Content */}
          <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
            {/* The Badge */}
            <div className="absolute top-0 right-0 lg:right-10 z-20 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-100 flex flex-col items-center gap-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">— PROUD TO BE —</div>
              <div className="text-lg font-black text-[#ea580c] tracking-wider">INDIAN</div>
              <div className="text-[10px] font-bold text-[#067a46] text-center max-w-[120px] leading-tight mt-1">PROUD TO SERVE FRESHNESS</div>
              <div className="w-6 h-6 mt-2 rounded-full border-2 border-blue-800 flex items-center justify-center">
                 <div className="w-3 h-3 border-[1.5px] border-blue-800 rounded-full flex items-center justify-center">
                    <span className="block w-full h-[1px] bg-blue-800 rotate-0"></span>
                    <span className="block w-full h-[1px] bg-blue-800 rotate-45 absolute"></span>
                    <span className="block w-full h-[1px] bg-blue-800 rotate-90 absolute"></span>
                    <span className="block w-full h-[1px] bg-blue-800 rotate-[135deg] absolute"></span>
                 </div>
              </div>
            </div>

            {/* The Basket Image */}
            <div className="relative w-full max-w-xl aspect-square z-10">
              <Image
                src="/images/hero_basket_transparent.png"
                alt="Fresh Fruit and Vegetable Basket"
                fill
                className="object-contain drop-shadow-2xl scale-110"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Floating Glass Feature Benefit Strip */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 -mt-8 md:-mt-12 pb-10">
        <div className="bg-white rounded-2xl md:rounded-full border border-slate-100 shadow-soft p-5 md:py-5 md:px-8 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          {benefits.map((b, idx) => (
            <div key={b.title} className="flex items-center gap-3 min-w-[180px] flex-1">
              <div className="w-10 h-10 rounded-full bg-white text-[#067a46] border border-[#067a46]/20 flex items-center justify-center shrink-0">
                <b.icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="font-bold text-sm text-[#0f172a]">{b.title}</div>
                <div className="text-[11px] text-slate-500 leading-tight">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
