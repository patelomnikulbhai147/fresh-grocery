"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Home, Building2 } from "lucide-react";

export function InstantOrderBulkOrderCards() {
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-transparent">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-stretch">

          {/* Card 1: FLASHKART NOW — B2C */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 md:p-8 border border-emerald-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center shadow-sm shrink-0">
                  <Home className="w-6 h-6 sm:w-7 sm:h-7 text-[#16a34a]" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                    FlashKart <span className="text-[#16a34a]">Now</span>
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-[#16a34a]">
                    For Home / Doorstep
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                Fresh vegetables, fruits and daily essentials delivered quickly
                to your doorstep.
              </p>

              <div className="my-5 space-y-2.5">
                {["Fresh & premium quality", "Fast doorstep delivery", "Safe & hygienic packaging"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#16a34a] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="relative w-full h-[140px] sm:h-[170px] my-3 overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/instant_order_scooter.png"
                  alt="Instant doorstep delivery"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/shop"
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Card 2: FLASHKART BUSINESS — B2B */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] p-5 sm:p-7 md:p-8 border border-purple-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-50 text-[#2b1a4e] border border-purple-200 flex items-center justify-center shadow-sm shrink-0">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-[#2b1a4e]" />
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
                    FlashKart <span className="text-[#2b1a4e]">Business</span>
                  </h2>
                  <p className="text-sm sm:text-base font-bold text-[#ea580c]">
                    For Hotels, Restaurants, Hostels, PGs, Shops & Businesses
                  </p>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                Bulk quantities, better business pricing and scheduled supply for
                your kitchen, mess or store.
              </p>

              <div className="my-5 space-y-2.5">
                {["Wholesale & tiered pricing", "Scheduled bulk deliveries", "Reliable daily supply"].map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-slate-800 font-semibold text-sm">
                    <CheckCircle2 className="w-4.5 h-4.5 text-[#ea580c] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="relative w-full h-[140px] sm:h-[170px] my-3 overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/bulk_order_crates.png"
                  alt="Wholesale vegetable crates for business supply"
                  fill
                  sizes="(max-width: 1024px) 90vw, 45vw"
                  className="object-contain p-1"
                  unoptimized
                />
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/bulk"
                className="w-full bg-[#2b1a4e] hover:bg-[#201239] text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>Order in Bulk</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
