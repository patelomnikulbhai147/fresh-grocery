"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Bike, Building2 } from "lucide-react";

export function InstantOrderBulkOrderCards() {
  return (
    <section className="py-8 sm:py-10 md:py-12 bg-transparent">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Instant Order (Green Theme) */}
          <div className="bg-gradient-to-b from-[#f0fdf4] via-[#f0fdf4]/80 to-white rounded-[24px] p-6 sm:p-8 border border-emerald-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
              {/* Top Icon inside soft green circle */}
              <div className="w-14 h-14 rounded-full bg-[#e6f4ea] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Bike className="w-7 h-7 text-[#16a34a]" />
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 text-center">
                Instant Order
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#16a34a] text-center mt-1">
                For Doorstep
              </p>

              {/* Description */}
              <p className="text-slate-600 text-sm text-center mt-3 max-w-sm mx-auto leading-relaxed">
                Order your daily vegetables & fruits and get it delivered fast at your doorstep.
              </p>

              {/* Features List */}
              <div className="my-6 space-y-3 max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                  <span>Fresh & Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                  <span>Fast & On-time Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                  <span>Safe & Hygienic Packaging</span>
                </div>
              </div>

              {/* Illustration Image */}
              <div className="relative w-full h-[180px] sm:h-[200px] my-4 overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/instant_order_scooter.png"
                  alt="Instant Delivery Scooter"
                  fill
                  sizes="400px"
                  className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/shop"
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-extrabold py-3.5 sm:py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base transition shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Bulk Order (Orange Theme) */}
          <div className="bg-gradient-to-b from-[#fff7ed] via-[#fff7ed]/80 to-white rounded-[24px] p-6 sm:p-8 border border-amber-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
            <div>
              {/* Top Icon inside soft orange circle */}
              <div className="w-14 h-14 rounded-full bg-[#fff0e6] text-[#f97316] border border-[#fed7aa] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 className="w-7 h-7 text-[#f97316]" />
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#ea580c] text-center">
                Bulk Order
              </h2>
              <p className="text-base sm:text-lg font-bold text-[#f97316] text-center mt-1">
                For Hostel, PG, Hotel & Shops
              </p>

              {/* Description */}
              <p className="text-slate-600 text-sm text-center mt-3 max-w-sm mx-auto leading-relaxed">
                Get the best prices for bulk orders with consistent quality and timely supply.
              </p>

              {/* Features List */}
              <div className="my-6 space-y-3 max-w-xs mx-auto">
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#f97316] shrink-0" />
                  <span>Fresh & Premium Quality</span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#f97316] shrink-0" />
                  <span>Fast & On-time Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#f97316] shrink-0" />
                  <span>Safe & Hygienic Packaging</span>
                </div>
              </div>

              {/* Illustration Image */}
              <div className="relative w-full h-[180px] sm:h-[200px] my-4 overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/bulk_order_crates.png"
                  alt="Wholesale Vegetable Crates"
                  fill
                  sizes="400px"
                  className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                href="/bulk"
                className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold py-3.5 sm:py-4 px-6 rounded-xl flex items-center justify-center gap-2 text-base transition shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <span>Get Bulk Quote</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
