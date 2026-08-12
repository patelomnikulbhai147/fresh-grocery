"use client";
import Link from "next/link";
import { Store, ArrowRight } from "lucide-react";
import Image from "next/image";

export function FranchiseSection() {
  return (
    <section id="franchise" className="py-10 md:py-14 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        
        {/* Franchise Card Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-50/80 via-white to-orange-50/80 border border-slate-200/80 p-8 md:p-12 overflow-hidden shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Produce Graphic Decorative Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none opacity-20 hidden md:block">
            <Image
              src="/images/products/tomato.jpg"
              alt=""
              fill
              className="object-cover rounded-l-3xl"
            />
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none opacity-20 hidden md:block">
            <Image
              src="/images/products/apple.jpg"
              alt=""
              fill
              className="object-cover rounded-r-3xl"
            />
          </div>

          {/* Center Content */}
          <div className="relative z-10 max-w-2xl text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-5">
            {/* Store Badge Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#067a46] border border-emerald-200 flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900">
                Bring FlashKart to Your Area
              </h2>
              <p className="mt-1.5 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                Interested in starting a FlashKart shop? <br className="hidden sm:inline" />
                Explore our franchise opportunity.
              </p>
            </div>
          </div>

          {/* Right CTA Button */}
          <div className="relative z-10 shrink-0">
            <Link
              href="/franchise"
              className="bg-[#063b25] hover:bg-[#042a1a] text-white font-extrabold px-7 py-3.5 rounded-full text-xs md:text-sm transition shadow-md flex items-center gap-2 group"
            >
              <span>Know More About Franchise</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
