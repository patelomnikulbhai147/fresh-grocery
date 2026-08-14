"use client";

import Link from "next/link";
import { Leaf, Apple, Milk, ArrowRight } from "lucide-react";

export function CategoryBannerRow() {
  return (
    <section className="w-full bg-white pt-6 pb-8 border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          
          {/* 1. VEGETABLES CARD */}
          <Link
            href="/shop?cat=vegetables"
            className="group relative bg-[#f1f9f3] hover:bg-[#eaf6ed] border border-[#d6edd9] rounded-2xl md:rounded-[22px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 min-h-[175px] sm:min-h-[185px]"
          >
            {/* Left Content Column */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[58%] sm:max-w-[56%]">
              <div>
                {/* Premium Circular Glassy Icon Badge */}
                <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-emerald-200/70 flex items-center justify-center text-[#067a46] shadow-xs mb-3.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Leaf className="w-5.5 h-5.5 text-[#067a46]" strokeWidth={2.2} />
                </div>
                
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#0b5e35] leading-tight">
                  Vegetables
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug mt-1.5">
                  Farm fresh vegetables straight to your home
                </p>
              </div>

              {/* Bottom Arrow Button */}
              <div className="mt-4">
                <span className="w-9 h-9 rounded-full bg-white/90 border border-emerald-100 flex items-center justify-center text-[#067a46] group-hover:bg-[#067a46] group-hover:text-white transition-all duration-200 shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Seamless Integrated Food Image (No boundary box, emerges naturally from lower-right) */}
            <div className="absolute -right-1 -bottom-1 w-[48%] h-[95%] z-0 pointer-events-none flex items-end justify-end overflow-hidden">
              <img
                src="/images/category_vegetables_basket.png"
                alt="Fresh Vegetables Basket"
                className="max-h-full max-w-full object-contain object-right-bottom group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                style={{
                  maskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                }}
              />
            </div>
          </Link>

          {/* 2. FRUITS CARD */}
          <Link
            href="/shop?cat=fruits"
            className="group relative bg-[#fdf2f2] hover:bg-[#fae8e8] border border-[#fce1e1] rounded-2xl md:rounded-[22px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 min-h-[175px] sm:min-h-[185px]"
          >
            {/* Left Content Column */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[58%] sm:max-w-[56%]">
              <div>
                {/* Premium Circular Glassy Icon Badge */}
                <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-red-200/70 flex items-center justify-center text-[#b91c1c] shadow-xs mb-3.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Apple className="w-5.5 h-5.5 text-[#b91c1c]" strokeWidth={2.2} />
                </div>

                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#b91c1c] leading-tight">
                  Fruits
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug mt-1.5">
                  Juicy, natural & handpicked for your family
                </p>
              </div>

              {/* Bottom Arrow Button */}
              <div className="mt-4">
                <span className="w-9 h-9 rounded-full bg-white/90 border border-red-100 flex items-center justify-center text-[#b91c1c] group-hover:bg-[#b91c1c] group-hover:text-white transition-all duration-200 shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Seamless Integrated Food Image (No boundary box, emerges naturally from lower-right) */}
            <div className="absolute -right-1 -bottom-1 w-[48%] h-[95%] z-0 pointer-events-none flex items-end justify-end overflow-hidden">
              <img
                src="/images/category_fruits_display.png"
                alt="Fresh Fruits"
                className="max-h-full max-w-full object-contain object-right-bottom group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                style={{
                  maskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                }}
              />
            </div>
          </Link>

          {/* 3. DAIRY PRODUCTS CARD */}
          <Link
            href="/shop?cat=dairy"
            className="group relative bg-[#f0f6ff] hover:bg-[#e5effe] border border-[#dbe6fe] rounded-2xl md:rounded-[22px] p-5 sm:p-6 flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 min-h-[175px] sm:min-h-[185px]"
          >
            {/* Left Content Column */}
            <div className="flex flex-col justify-between h-full z-10 max-w-[58%] sm:max-w-[56%]">
              <div>
                {/* Premium Circular Glassy Icon Badge */}
                <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs border border-blue-200/70 flex items-center justify-center text-[#1d4ed8] shadow-xs mb-3.5 shrink-0 group-hover:scale-105 transition-transform duration-300">
                  <Milk className="w-5.5 h-5.5 text-[#1d4ed8]" strokeWidth={2.2} />
                </div>

                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#1d4ed8] leading-tight">
                  Dairy Products
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-snug mt-1.5">
                  Pure, fresh & healthy dairy essentials
                </p>
              </div>

              {/* Bottom Arrow Button */}
              <div className="mt-4">
                <span className="w-9 h-9 rounded-full bg-white/90 border border-blue-100 flex items-center justify-center text-[#1d4ed8] group-hover:bg-[#1d4ed8] group-hover:text-white transition-all duration-200 shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* Seamless Integrated Food Image (No boundary box, emerges naturally from lower-right) */}
            <div className="absolute -right-1 -bottom-1 w-[48%] h-[95%] z-0 pointer-events-none flex items-end justify-end overflow-hidden">
              <img
                src="/images/category_dairy_display.png"
                alt="Dairy Products"
                className="max-h-full max-w-full object-contain object-right-bottom group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                style={{
                  maskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                  WebkitMaskImage: "radial-gradient(ellipse at 85% 85%, black 65%, transparent 100%)",
                }}
              />
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
